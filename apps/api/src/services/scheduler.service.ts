import { prisma } from '@/config/prisma';
import { logger } from '@/config/logger';

export const schedulerService = {
  /** Publish scheduled items whose scheduledAt date has arrived. */
  async publishScheduledContent(): Promise<{
    projects: number;
    blogPosts: number;
    researchPapers: number;
    pages: number;
  }> {
    const now = new Date();

    try {
      const [projects, blogPosts, researchPapers, pages] = await Promise.all([
        prisma.project.updateMany({
          where: {
            status: 'scheduled',
            scheduledAt: { lte: now },
          },
          data: {
            status: 'published',
            publishedAt: now,
          },
        }),
        prisma.blogPost.updateMany({
          where: {
            status: 'scheduled',
            scheduledAt: { lte: now },
          },
          data: {
            status: 'published',
            publishedAt: now,
          },
        }),
        prisma.researchPaper.updateMany({
          where: {
            status: 'scheduled',
            scheduledAt: { lte: now },
          },
          data: {
            status: 'published',
            publishedAt: now,
          },
        }),
        prisma.page.updateMany({
          where: {
            status: 'scheduled',
            scheduledAt: { lte: now },
          },
          data: {
            status: 'published',
            publishedAt: now,
          },
        }),
      ]);

      const totalPublished = projects.count + blogPosts.count + researchPapers.count + pages.count;
      if (totalPublished > 0) {
        logger.info(
          {
            projects: projects.count,
            blogPosts: blogPosts.count,
            researchPapers: researchPapers.count,
            pages: pages.count,
          },
          'Published scheduled content items',
        );
      }

      return {
        projects: projects.count,
        blogPosts: blogPosts.count,
        researchPapers: researchPapers.count,
        pages: pages.count,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to run scheduled content publisher');
      return { projects: 0, blogPosts: 0, researchPapers: 0, pages: 0 };
    }
  },

  /** Start interval timer for scheduler (every 5 minutes). */
  startScheduler(intervalMs = 5 * 60 * 1000): NodeJS.Timeout {
    logger.info({ intervalMs }, 'Starting background content publisher scheduler');
    // Run immediately on boot
    this.publishScheduledContent().catch((err) => {
      logger.error({ err }, 'Initial scheduler run failed');
    });

    return setInterval(() => {
      this.publishScheduledContent().catch((err) => {
        logger.error({ err }, 'Scheduler tick failed');
      });
    }, intervalMs);
  },
};
