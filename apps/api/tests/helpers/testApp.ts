import request from 'supertest';
import { app } from '@/index';
import { tokenService } from '@/services/token.service';

export const testClient = request(app);

export function createMockAdminToken(payload?: {
  sub?: string;
  isAdmin?: boolean;
  username?: string;
}): string {
  return tokenService.signAccessToken({
    sub: payload?.sub || 'test-admin-id',
    isAdmin: payload?.isAdmin ?? true,
    username: payload?.username || 'admin',
  });
}
