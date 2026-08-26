import { describe, it, expect } from 'vitest';
import { testClient } from '../helpers/testApp';

describe('Auth API (Integration)', () => {
  it('POST /api/v1/auth/login should reject empty payload with 422', async () => {
    const res = await testClient.post('/api/v1/auth/login').send({});

    expect(res.status).toBe(422);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('POST /api/v1/auth/login should reject invalid credentials with 401', async () => {
    const res = await testClient.post('/api/v1/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('GET /api/v1/auth/me should reject request without token with 401', async () => {
    const res = await testClient.get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('POST /api/v1/auth/refresh should reject malformed refresh token with 401', async () => {
    const res = await testClient.post('/api/v1/auth/refresh').send({
      refreshToken: 'malformed.token.payload',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });
});
