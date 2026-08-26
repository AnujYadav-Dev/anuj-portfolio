import type { MetadataRoute } from 'next';
import { serverApi } from '@/lib/server-api';
import { getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = getSiteUrl();

  try {
    const settings = await serverApi.getSiteSettings();
    const isIndexingEnabled = settings.robots_indexing_enabled !== 'false';

    if (!isIndexingEnabled) {
      return {
        rules: {
          userAgent: '*',
          disallow: '/',
        },
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
      };
    }

    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/admin'],
      },
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  } catch (error) {
    console.warn('[robots] Failed to fetch settings for robots.txt:', error);
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/admin'],
      },
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  }
}
