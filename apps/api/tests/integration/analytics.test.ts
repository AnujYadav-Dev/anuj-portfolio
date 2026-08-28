import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from '../helpers/testApp';
import { prisma } from '@/config/prisma';
import { tokenService } from '@/services/token.service';

describe('Analytics & Visitor Telemetry API (Integration)', () => {
  const testSessionId = `test_sess_${Date.now()}`;
  let adminToken: string;

  beforeAll(async () => {
    let author = await prisma.author.findFirst({ where: { isAdmin: true } });
    if (!author) {
      author = await prisma.author.findFirst();
    }
    if (author) {
      adminToken = tokenService.signAccessToken({
        sub: author.id,
        isAdmin: true,
        username: author.username,
      });
    }
  });

  it('POST /api/v1/analytics/session should register a new visitor session with 5-param UTMs', async () => {
    const res = await testClient
      .post('/api/v1/analytics/session')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
      .set('cf-connecting-ip', '1.1.1.1')
      .set('cf-ipcountry', 'US')
      .send({
        sessionId: testSessionId,
        referrer: 'https://twitter.com/post/123',
        screenWidth: 1920,
        screenHeight: 1080,
        language: 'en-US',
        timezone: 'America/New_York',
        utmSource: 'twitter',
        utmMedium: 'social',
        utmCampaign: 'launch_eval',
        utmTerm: 'systems_engineer',
        utmContent: 'hero_cta',
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('sessionId', testSessionId);
    expect(res.body.data).toHaveProperty('country', 'US');
    expect(res.body.data).toHaveProperty('utmSource', 'twitter');
    expect(res.body.data).toHaveProperty('utmCampaign', 'launch_eval');
    expect(res.body.data).toHaveProperty('utmTerm', 'systems_engineer');
  });

  it('POST /api/v1/analytics/view should record a page view hit without race condition', async () => {
    const res = await testClient.post('/api/v1/analytics/view').send({
      sessionId: testSessionId,
      path: '/works/distributed-engine',
      title: 'Distributed Analytics Engine | Case Study',
      referrer: 'https://twitter.com/post/123',
      loadTimeMs: 420,
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('path', '/works/distributed-engine');
    expect(res.body.data).toHaveProperty('loadTimeMs', 420);
  });

  it('POST /api/v1/analytics/beacon should record page dwell duration and scroll depth', async () => {
    const res = await testClient.post('/api/v1/analytics/beacon').send({
      sessionId: testSessionId,
      path: '/works/distributed-engine',
      durationSeconds: 75,
      scrollDepth: 100,
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('success', true);
  });

  it('POST /api/v1/analytics/click should record code copy and outbound link actions', async () => {
    const copyRes = await testClient.post('/api/v1/analytics/click').send({
      sessionId: testSessionId,
      targetType: 'code_copy',
      targetUrl: '/works/distributed-engine',
      label: 'Copy: TypeScript',
    });

    expect(copyRes.status).toBe(201);
    expect(copyRes.body.data).toHaveProperty('targetType', 'code_copy');
    expect(copyRes.body.data).toHaveProperty('label', 'Copy: TypeScript');

    const downloadRes = await testClient.post('/api/v1/analytics/click').send({
      sessionId: testSessionId,
      targetType: 'resume_download',
      targetUrl: '/uploads/resume.pdf',
      label: 'Resume Download PDF',
    });

    expect(downloadRes.status).toBe(201);
    expect(downloadRes.body.data).toHaveProperty('targetType', 'resume_download');
  });

  it('GET /api/v1/analytics/admin/live-pulse should return real-time online visitors count', async () => {
    const res = await testClient
      .get('/api/v1/analytics/admin/live-pulse')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('activeVisitors');
    expect(typeof res.body.data.activeVisitors).toBe('number');
    expect(res.body.data.activeVisitors).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/analytics/admin/overview should return comprehensive overview KPIs and breakdowns', async () => {
    const res = await testClient
      .get('/api/v1/analytics/admin/overview?period=24h')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalPageViews');
    expect(res.body.data).toHaveProperty('uniqueVisitors');
    expect(res.body.data).toHaveProperty('bounceRatePercent');
    expect(res.body.data).toHaveProperty('intentBreakdown');
    expect(Array.isArray(res.body.data.intentBreakdown)).toBe(true);
  });

  it('GET /api/v1/analytics/admin/timeseries should return hourly points for 24h period', async () => {
    const res = await testClient
      .get('/api/v1/analytics/admin/timeseries?period=24h')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(24);
    expect(res.body.data[0].date).toMatch(/^\d{2}:00$/);
  });

  it('GET /api/v1/analytics/admin/top-pages should return top visited routes with true unique visitors', async () => {
    const res = await testClient
      .get('/api/v1/analytics/admin/top-pages?period=24h')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const enginePage = res.body.data.find((p: { path: string }) => p.path === '/works/distributed-engine');
    expect(enginePage).toBeDefined();
    expect(enginePage).toHaveProperty('views');
    expect(enginePage).toHaveProperty('uniqueVisitors');
  });

  it('GET /api/v1/analytics/admin/geo-map should return geographic country distribution', async () => {
    const res = await testClient
      .get('/api/v1/analytics/admin/geo-map?period=30d')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/analytics/admin/export should return CSV telemetry export', async () => {
    const res = await testClient
      .get('/api/v1/analytics/admin/export?type=visitors&period=30d&format=csv')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Session ID');
    expect(res.text).toContain(testSessionId);
  });
});
