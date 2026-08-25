import jwt from 'jsonwebtoken';
import { config } from '@/config/env';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from '@/config/constants';
import { UnauthorizedError } from '@/utils/errors';
import { hashToken, generateSecureToken } from '@/utils/hash';

export interface AccessTokenPayload {
  sub: string;
  isAdmin: boolean;
  username: string;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: 'refresh';
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export const tokenService = {
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
  },

  signRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      algorithm: 'HS256',
      expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    });
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as AccessTokenPayload;
      return payload;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(token, config.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
      }) as RefreshTokenPayload;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  },

  issueTokenPair(author: {
    id: string;
    isAdmin: boolean;
    username: string;
  }, sessionId: string): IssuedTokens {
    const accessToken = this.signAccessToken({
      sub: author.id,
      isAdmin: author.isAdmin,
      username: author.username,
    });

    const refreshToken = this.signRefreshToken({
      sub: author.id,
      sessionId,
      type: 'refresh',
    });

    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

    return { accessToken, refreshToken, refreshTokenHash, expiresAt };
  },

  generateSessionId(): string {
    return generateSecureToken();
  },
};
