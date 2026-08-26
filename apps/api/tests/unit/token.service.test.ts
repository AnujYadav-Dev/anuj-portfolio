import { describe, it, expect } from 'vitest';
import { tokenService } from '@/services/token.service';
import { UnauthorizedError } from '@/utils/errors';

describe('TokenService (Unit)', () => {
  const mockAuthor = {
    id: 'author-123',
    isAdmin: true,
    username: 'anuj',
  };

  it('should generate and verify valid access tokens', () => {
    const token = tokenService.signAccessToken({
      sub: mockAuthor.id,
      isAdmin: mockAuthor.isAdmin,
      username: mockAuthor.username,
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = tokenService.verifyAccessToken(token);
    expect(decoded.sub).toBe(mockAuthor.id);
    expect(decoded.isAdmin).toBe(true);
    expect(decoded.username).toBe('anuj');
  });

  it('should throw UnauthorizedError on malformed access token', () => {
    expect(() => {
      tokenService.verifyAccessToken('invalid.token.structure');
    }).toThrow(UnauthorizedError);
  });

  it('should generate and verify refresh tokens', () => {
    const sessionId = 'session-456';
    const refreshToken = tokenService.signRefreshToken({
      sub: mockAuthor.id,
      sessionId,
      type: 'refresh',
    });

    expect(refreshToken).toBeDefined();

    const decoded = tokenService.verifyRefreshToken(refreshToken);
    expect(decoded.sub).toBe(mockAuthor.id);
    expect(decoded.sessionId).toBe(sessionId);
    expect(decoded.type).toBe('refresh');
  });

  it('should issue complete token pair with hash and expiration', () => {
    const sessionId = tokenService.generateSessionId();
    const tokenPair = tokenService.issueTokenPair(mockAuthor, sessionId);

    expect(tokenPair.accessToken).toBeDefined();
    expect(tokenPair.refreshToken).toBeDefined();
    expect(tokenPair.refreshTokenHash).toBeDefined();
    expect(tokenPair.expiresAt).toBeInstanceOf(Date);
    expect(tokenPair.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
