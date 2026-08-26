import { describe, it, expect } from 'vitest';
import { testClient } from '../helpers/testApp';

describe('Health API (Integration)', () => {
  it('GET /api/v1/health should return liveness status OK and timestamp', async () => {
    const res = await testClient.get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });

  it('GET /api/v1/health/ready should return readiness status and database connectivity', async () => {
    const res = await testClient.get('/api/v1/health/ready');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ready');
    expect(res.body).toHaveProperty('database', 'connected');
  });
});
