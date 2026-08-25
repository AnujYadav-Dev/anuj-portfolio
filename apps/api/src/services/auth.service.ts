import type {
  LoginInput,
  RefreshTokenInput,
  AuthResponse,
  UpdateProfileInput,
  ChangePasswordInput,
} from '@portfolio/shared';
import { authorRepository } from '@/repositories/author.repository';
import { sessionRepository } from '@/repositories/session.repository';
import { tokenService } from '@/services/token.service';
import { verifyPassword, hashPassword } from '@/utils/password';
import { mapAuthorToDto } from '@/utils/mappers';
import { UnauthorizedError, NotFoundError, ValidationError } from '@/utils/errors';
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

  async updateProfile(authorId: string, input: UpdateProfileInput) {
    const existing = await authorRepository.findByIdWithAvatar(authorId);
    if (!existing) {
      throw new NotFoundError('Author not found');
    }

    if (input.email && input.email !== existing.email) {
      const emailConflict = await authorRepository.findByEmail(input.email);
      if (emailConflict && emailConflict.id !== authorId) {
        throw new ValidationError('Email already in use', {
          email: ['This email is already registered'],
        });
      }
    }

    const updated = await authorRepository.update(authorId, {
      displayName: input.displayName,
      username: input.username,
      email: input.email,
      bio: input.bio,
    });

    return mapAuthorToDto(updated);
  },

  async changePassword(authorId: string, input: ChangePasswordInput) {
    const author = await authorRepository.findByIdWithAvatar(authorId);
    if (!author) {
      throw new NotFoundError('Author not found');
    }

    const isValid = await verifyPassword(input.currentPassword, author.passwordHash);
    if (!isValid) {
      throw new ValidationError('Invalid current password', {
        currentPassword: ['Current password does not match'],
      });
    }

    const newHash = await hashPassword(input.newPassword);
    await authorRepository.updatePassword(authorId, newHash);
  },
};
