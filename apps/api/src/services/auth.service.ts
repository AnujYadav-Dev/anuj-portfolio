import type { LoginInput, RefreshTokenInput, AuthResponse } from '@portfolio/shared';
import { authorRepository } from '@/repositories/author.repository';
import { sessionRepository } from '@/repositories/session.repository';
import { tokenService } from '@/services/token.service';
import { verifyPassword } from '@/utils/password';
import { mapAuthorToDto } from '@/utils/mappers';
import { UnauthorizedError } from '@/utils/errors';
import { hashToken, generateSecureToken } from '@/utils/hash';
import { DUMMY_PASSWORD_HASH, REFRESH_TOKEN_TTL_SECONDS } from '@/config/constants';

export const authService = {
  async login(
    input: LoginInput,
    context: { userAgent: string | null; ipAddress: string | null },
  ): Promise<AuthResponse> {
    const author = await authorRepository.findByEmail(input.email);
    const passwordHash = author?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isValid = await verifyPassword(input.password, passwordHash);

    if (!author || !isValid || !author.isEnabled || !author.isAdmin) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    const placeholderHash = hashToken(generateSecureToken());

    const session = await sessionRepository.create({
      authorId: author.id,
      refreshTokenHash: placeholderHash,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt,
    });

    const accessToken = tokenService.signAccessToken({
      sub: author.id,
      isAdmin: author.isAdmin,
      username: author.username,
    });

    const refreshToken = tokenService.signRefreshToken({
      sub: author.id,
      sessionId: session.id,
      type: 'refresh',
    });

    const refreshTokenHash = hashToken(refreshToken);
    await sessionRepository.updateRefreshTokenHash(session.id, refreshTokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      author: mapAuthorToDto(author),
    };
  },

  async refresh(input: RefreshTokenInput): Promise<AuthResponse> {
    const payload = tokenService.verifyRefreshToken(input.refreshToken);
    const currentHash = hashToken(input.refreshToken);

    const session = await sessionRepository.findByRefreshTokenHash(currentHash);

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (session.authorId !== payload.sub) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const author = session.author;

    if (!author.isEnabled || !author.isAdmin) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const accessToken = tokenService.signAccessToken({
      sub: author.id,
      isAdmin: author.isAdmin,
      username: author.username,
    });

    const newRefreshToken = tokenService.signRefreshToken({
      sub: author.id,
      sessionId: session.id,
      type: 'refresh',
    });

    const newRefreshTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

    await sessionRepository.updateRefreshTokenHash(
      session.id,
      newRefreshTokenHash,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      author: mapAuthorToDto(author),
    };
  },

  async logout(refreshToken: string): Promise<void> {
    const refreshTokenHash = hashToken(refreshToken);
    await sessionRepository.deleteByRefreshTokenHash(refreshTokenHash);
  },
};
