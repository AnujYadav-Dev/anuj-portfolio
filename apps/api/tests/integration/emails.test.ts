import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from '../helpers/testApp';
import { prisma } from '@/config/prisma';
import { tokenService } from '@/services/token.service';

describe('Email Templates & Engine API (Integration)', () => {
  let adminToken: string;

  beforeAll(async () => {
    const author = await prisma.author.findFirst({ where: { isAdmin: true } });
    if (author) {
      adminToken = tokenService.signAccessToken({
        sub: author.id,
        isAdmin: true,
        username: author.username,
      });
    }
  });

  it('GET /api/v1/email-templates should return all seeded email templates with auth', async () => {
    const res = await testClient
      .get('/api/v1/email-templates')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(13);

    // Verify key template fields
    const first = res.body.data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('purpose');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('subject');
    expect(first).toHaveProperty('bodyHtml');
    expect(first).toHaveProperty('isActive');
  });

  it('GET /api/v1/email-templates?purpose=contact_auto_reply should filter templates by purpose', async () => {
    const res = await testClient
      .get('/api/v1/email-templates?purpose=contact_auto_reply')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(
      res.body.data.every((t: { purpose: string }) => t.purpose === 'contact_auto_reply'),
    ).toBe(true);
  });

  it('POST /api/v1/email-templates should create a new variation for a purpose', async () => {
    const res = await testClient
      .post('/api/v1/email-templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        purpose: 'contact_auto_reply',
        name: 'Test Dark Theme Variation',
        subject: 'Thank you for your message {{name}} [Test]',
        bodyHtml: '<p>Hi {{name}}, this is a test template variation.</p>',
        bodyText: 'Hi {{name}}, test variation.',
        isActive: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe('Test Dark Theme Variation');
    expect(res.body.data.isActive).toBe(false);

    const createdId = res.body.data.id;

    // Test 1-click active switching
    const activateRes = await testClient
      .post(`/api/v1/email-templates/${createdId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(activateRes.status).toBe(200);
    expect(activateRes.body.data.isActive).toBe(true);

    // Cleanup: Delete created variation
    await testClient
      .delete(`/api/v1/email-templates/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  it('POST /api/v1/email-templates/test should validate test recipient email', async () => {
    const res = await testClient
      .post('/api/v1/email-templates/test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        to: 'invalid-email',
      });

    expect(res.status).toBe(422);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('POST /api/v1/newsletter/admin/broadcast should validate broadcast payload', async () => {
    const res = await testClient
      .post('/api/v1/newsletter/admin/broadcast')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        subject: '',
        contentHtml: '',
      });

    expect(res.status).toBe(422);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });
});
