import { describe, it, expect } from 'vitest';
import { testClient } from '../helpers/testApp';

describe('Content API (Integration)', () => {
  it('GET /api/v1/projects should return paginated published projects list', async () => {
    const res = await testClient.get('/api/v1/projects');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET /api/v1/blogs should return paginated published blog posts list', async () => {
    const res = await testClient.get('/api/v1/blogs');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET /api/v1/research should return published research papers list', async () => {
    const res = await testClient.get('/api/v1/research');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/homepage-sections should return active homepage sections in sort order', async () => {
    const res = await testClient.get('/api/v1/homepage-sections');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/nav-items should return navigation items', async () => {
    const res = await testClient.get('/api/v1/nav-items');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/skills should return skill categories and skills', async () => {
    const res = await testClient.get('/api/v1/skills');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/projects should reject unauthorized creation with 401', async () => {
    const res = await testClient.post('/api/v1/projects').send({
      title: 'Unauthorized Project',
      slug: 'unauthorized-project',
      shortDescription: 'Test short description',
      content: '# Case study',
    });

    expect(res.status).toBe(401);
  });
});
