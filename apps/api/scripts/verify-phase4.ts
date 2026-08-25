import http from 'node:http';
import { app } from '../src/index';
import { prisma } from '../src/config/prisma';

async function runVerification() {
  console.log('=== Starting Phase 4 Backend Domain Modules Verification ===\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3001;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`Test server running at ${baseUrl}\n`);

  try {
    // 1. Health & Public Stats
    console.log('1. Testing Health & Public Stats...');
    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    console.log(`   GET /api/v1/health -> Status: ${healthRes.status}`);
    if (!healthRes.ok) throw new Error('Health check failed');

    const statsRes = await fetch(`${baseUrl}/api/v1/stats`);
    const statsData = await statsRes.json();
    console.log(`   GET /api/v1/stats -> Status: ${statsRes.status}, data:`, statsData);
    if (!statsRes.ok) throw new Error('Stats endpoint failed');

    // 2. Public Content Modules
    console.log('\n2. Testing Public Content Modules...');
    const endpoints = [
      '/api/v1/project-categories',
      '/api/v1/projects',
      '/api/v1/blog-categories',
      '/api/v1/blogs',
      '/api/v1/research',
      '/api/v1/pages',
      '/api/v1/content-blocks',
      '/api/v1/about-sections',
      '/api/v1/skill-categories',
      '/api/v1/skills',
      '/api/v1/experiences',
      '/api/v1/education',
      '/api/v1/certificates',
      '/api/v1/achievements',
      '/api/v1/timeline-events',
      '/api/v1/social-links',
      '/api/v1/opensource',
      '/api/v1/gallery',
      '/api/v1/homepage-sections',
      '/api/v1/nav-items',
      '/api/v1/site-settings',
      '/api/v1/guestbook',
      '/api/v1/testimonials',
      '/api/v1/tags',
      '/api/v1/search?q=test',
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${baseUrl}${ep}`);
      const body = await res.json();
      console.log(`   GET ${ep} -> Status: ${res.status}`);
      if (!res.ok) {
        throw new Error(`Endpoint ${ep} returned status ${res.status}: ${JSON.stringify(body)}`);
      }
    }

    console.log('\n=== All Phase 4 Public Endpoints Verified Successfully! ===');
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exitCode = 1;
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runVerification();
