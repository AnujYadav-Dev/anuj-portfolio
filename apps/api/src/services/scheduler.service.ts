import { prisma } from '@/config/prisma';
import { logger } from '@/config/logger';
import { emailService } from '@/services/email.service';
import { siteSettingRepository } from '@/repositories/siteSetting.repository';
import { EMAIL_TEMPLATE_KEYS } from '@portfolio/shared';

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
        const summaryLines: string[] = [];
        if (projects.count > 0) summaryLines.push(`• ${projects.count} Project(s)`);
        if (blogPosts.count > 0) summaryLines.push(`• ${blogPosts.count} Blog Post(s)`);
        if (researchPapers.count > 0)
          summaryLines.push(`• ${researchPapers.count} Research Paper(s)`);
        if (pages.count > 0) summaryLines.push(`• ${pages.count} Page(s)`);
        const publishedItemsSummary = summaryLines.join('\n');

        logger.info(
          {
            projects: projects.count,
            blogPosts: blogPosts.count,
            researchPapers: researchPapers.count,
            pages: pages.count,
          },
          'Published scheduled content items',
        );

        // Notify Admin of published content
        setImmediate(async () => {
          try {
            const setting = await siteSettingRepository.findByKey(
              'email_notifications_scheduled_publish_enabled',
            );
            if (setting && setting.value === 'false') return;

            const siteUrl = await emailService.resolveSiteUrl();
            const adminRecipients = await emailService.resolveAdminRecipients();
            for (const adminEmail of adminRecipients) {
              await emailService.sendTemplatedEmail({
                purpose: EMAIL_TEMPLATE_KEYS.CONTENT_PUBLISHED_ADMIN,
                to: adminEmail,
                variables: {
                  itemCount: String(totalPublished),
                  publishedItemsSummary,
                  publishedAt: now.toLocaleString(),
                  siteUrl,
                },
              });
            }
          } catch (err) {
            logger.error({ err }, 'Failed to send scheduled content published notification');
          }
        });
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
