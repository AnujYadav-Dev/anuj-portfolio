import { prisma } from '@/config/prisma';
import { logger } from '@/config/logger';
import { emailService } from '@/services/email.service';
import { contentBroadcastService } from '@/services/contentBroadcast.service';
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
      // Find all scheduled items ready to go live
      const [scheduledProjects, scheduledBlogs, scheduledPapers, scheduledPages] = await Promise.all([
        prisma.project.findMany({
          where: { status: 'scheduled', scheduledAt: { lte: now } },
          include: { category: true, coverImage: true },
        }),
        prisma.blogPost.findMany({
          where: { status: 'scheduled', scheduledAt: { lte: now } },
          include: { category: true, coverImage: true },
        }),
        prisma.researchPaper.findMany({
          where: { status: 'scheduled', scheduledAt: { lte: now } },
          include: { ogImage: true },
        }),
        prisma.page.findMany({
          where: { status: 'scheduled', scheduledAt: { lte: now } },
        }),
      ]);

      const totalPublished =
        scheduledProjects.length +
        scheduledBlogs.length +
        scheduledPapers.length +
        scheduledPages.length;

      if (totalPublished === 0) {
        return { projects: 0, blogPosts: 0, researchPapers: 0, pages: 0 };
      }

      // Update statuses to published
      await Promise.all([
        scheduledProjects.length > 0 &&
          prisma.project.updateMany({
            where: { id: { in: scheduledProjects.map((p) => p.id) } },
            data: { status: 'published', publishedAt: now },
          }),
        scheduledBlogs.length > 0 &&
          prisma.blogPost.updateMany({
            where: { id: { in: scheduledBlogs.map((b) => b.id) } },
            data: { status: 'published', publishedAt: now },
          }),
        scheduledPapers.length > 0 &&
          prisma.researchPaper.updateMany({
            where: { id: { in: scheduledPapers.map((r) => r.id) } },
            data: { status: 'published', publishedAt: now },
          }),
        scheduledPages.length > 0 &&
          prisma.page.updateMany({
            where: { id: { in: scheduledPages.map((p) => p.id) } },
            data: { status: 'published', publishedAt: now },
          }),
      ]);

      const summaryLines: string[] = [];
      if (scheduledProjects.length > 0) summaryLines.push(`• ${scheduledProjects.length} Project(s)`);
      if (scheduledBlogs.length > 0) summaryLines.push(`• ${scheduledBlogs.length} Blog Post(s)`);
      if (scheduledPapers.length > 0)
        summaryLines.push(`• ${scheduledPapers.length} Research Paper(s)`);
      if (scheduledPages.length > 0) summaryLines.push(`• ${scheduledPages.length} Page(s)`);
      const publishedItemsSummary = summaryLines.join('\n');

      logger.info(
        {
          projects: scheduledProjects.length,
          blogPosts: scheduledBlogs.length,
          researchPapers: scheduledPapers.length,
          pages: scheduledPages.length,
        },
        'Published scheduled content items',
      );

      // Trigger Subscriber Newsletter Broadcasts in background
      setImmediate(async () => {
        try {
          const [blogSetting, projectSetting, researchSetting] = await Promise.all([
            siteSettingRepository.findByKey('email_notifications_auto_broadcast_blog'),
            siteSettingRepository.findByKey('email_notifications_auto_broadcast_project'),
            siteSettingRepository.findByKey('email_notifications_auto_broadcast_research'),
          ]);

          if (blogSetting?.value !== 'false') {
            for (const blog of scheduledBlogs) {
              await contentBroadcastService.broadcastPublishedContent({
                contentType: 'blog',
                title: blog.title,
                slug: blog.slug,
                excerpt: blog.excerpt,
                readingTimeMinutes: blog.readingTimeMinutes,
                categoryName: blog.category?.name || null,
                coverImageUrl: blog.coverImage?.url || null,
              });
            }
          }

          if (projectSetting?.value === 'true') {
            for (const proj of scheduledProjects) {
              await contentBroadcastService.broadcastPublishedContent({
                contentType: 'project',
                title: proj.title,
                slug: proj.slug,
                excerpt: proj.shortDescription,
                categoryName: proj.category?.name || null,
                coverImageUrl: proj.coverImage?.url || null,
              });
            }
          }

          if (researchSetting?.value === 'true') {
            for (const paper of scheduledPapers) {
              await contentBroadcastService.broadcastPublishedContent({
                contentType: 'research',
                title: paper.title,
                slug: paper.slug,
                excerpt: paper.abstract,
                categoryName: paper.publicationName || null,
                coverImageUrl: paper.ogImage?.url || null,
              });
            }
          }
        } catch (err) {
          logger.error({ err }, 'Error broadcasting scheduled content to subscribers');
        }
      });

      // Notify Admin of published content report
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
          logger.error({ err }, 'Failed to send scheduled content published notification to admin');
        }
      });

      return {
        projects: scheduledProjects.length,
        blogPosts: scheduledBlogs.length,
        researchPapers: scheduledPapers.length,
        pages: scheduledPages.length,
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
