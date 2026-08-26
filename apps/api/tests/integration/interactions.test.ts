import { describe, it, expect } from 'vitest';
import { testClient } from '../helpers/testApp';

describe('Interactions API (Integration)', () => {
  it('POST /api/v1/contact should validate request and reject missing fields with 422', async () => {
    const res = await testClient.post('/api/v1/contact').send({
      email: 'not-an-email',
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(res.body.error.details).toHaveProperty('email');
    expect(res.body.error.details).toHaveProperty('name');
    expect(res.body.error.details).toHaveProperty('message');
  });

  it('GET /api/v1/guestbook should return approved guestbook entries', async () => {
    const res = await testClient.get('/api/v1/guestbook');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/newsletter/subscribe should validate email and reject invalid format with 422', async () => {
    const res = await testClient.post('/api/v1/newsletter/subscribe').send({
      email: 'invalid-email-string',
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });
});
