import { describe, it, expect } from 'vitest';
import { testClient } from '../helpers/testApp';

describe('Search & Discovery API (Integration)', () => {
  it('GET /api/v1/search should return matching entities across domains', async () => {
    const res = await testClient.get('/api/v1/search?q=fullstack&type=all');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('results');
    expect(Array.isArray(res.body.data.results)).toBe(true);
  });

  it('GET /api/v1/stats should return aggregate platform telemetry counts', async () => {
    const res = await testClient.get('/api/v1/stats');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('totalProjects');
    expect(res.body.data).toHaveProperty('totalBlogPosts');
  });
});
