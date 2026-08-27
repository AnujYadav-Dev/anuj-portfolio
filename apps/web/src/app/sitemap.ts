import type { MetadataRoute } from 'next';
import { serverApi } from '@/lib/server-api';
import { getSiteUrl } from '@/lib/seo';

export const revalidate = 3600; // revalidate sitemap at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const currentDate = new Date();

  // 1. Static Core Public Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/works`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/research`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/skills`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/my-timeline`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/certificates-achievements`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/resume`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/opensource`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/testimonials`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/guestbook`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/newsletter`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/stats`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // 2. Fetch all dynamic published entities in parallel
    const [blogs, projects, research, pages, aboutSections] = await Promise.all([
      serverApi.getAllPublishedBlogs(100),
      serverApi.getAllPublishedProjects(100),
      serverApi.getAllPublishedResearch(100),
      serverApi.getAllPublishedPages(100),
      serverApi.getEnabledAboutSections(),
    ]);

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${siteUrl}/blogs/${blog.slug}`,
      lastModified: blog.publishedAt ? new Date(blog.publishedAt) : currentDate,
      changeFrequency: 'weekly',
      priority: blog.isFeatured ? 0.85 : 0.75,
    }));

    const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
      url: `${siteUrl}/works/${project.slug}`,
      lastModified: project.publishedAt ? new Date(project.publishedAt) : currentDate,
      changeFrequency: 'monthly',
      priority: project.isFeatured ? 0.85 : 0.75,
    }));

    const researchRoutes: MetadataRoute.Sitemap = research.map((paper) => ({
      url: `${siteUrl}/research/${paper.slug}`,
      lastModified: paper.publishedAt ? new Date(paper.publishedAt) : currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    const reservedSlugs = new Set([
      'admin',
      'api',
      'works',
      'blogs',
      'research',
      'about',
      'skills',
      'my-timeline',
      'certificates-achievements',
      'resume',
      'contact',
      'guestbook',
      'newsletter',
      'opensource',
      'stats',
      'testimonials',
      'search',
      'feed.xml',
      'rss.xml',
      'sitemap.xml',
      'robots.txt',
    ]);

    const dynamicPageRoutes: MetadataRoute.Sitemap = pages
      .filter((page) => !reservedSlugs.has(page.slug))
      .map((page) => ({
        url: `${siteUrl}/${page.slug}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
      }));

    const aboutSectionRoutes: MetadataRoute.Sitemap = aboutSections.map((section) => ({
      url: `${siteUrl}/about/${section.slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...blogRoutes,
      ...projectRoutes,
      ...researchRoutes,
      ...dynamicPageRoutes,
      ...aboutSectionRoutes,
    ];
  } catch (error) {
    console.warn('[sitemap] Failed to fetch dynamic entities for sitemap:', error);
    return staticRoutes;
  }
}
