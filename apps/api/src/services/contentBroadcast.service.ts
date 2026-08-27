import { newsletterRepository } from '@/repositories/newsletter.repository';
import { emailService } from '@/services/email.service';
import { logger } from '@/config/logger';
import { EMAIL_TEMPLATE_KEYS } from '@portfolio/shared';

export interface BroadcastItemPayload {
  contentType: 'blog' | 'project' | 'research';
  title: string;
  slug: string;
  excerpt?: string | null;
  readingTimeMinutes?: number | null;
  categoryName?: string | null;
  coverImageUrl?: string | null;
  authorName?: string | null;
}

export const contentBroadcastService = {
  /** Generate HTML email template markup for a published content item. */
  generateContentHtml(item: BroadcastItemPayload, siteUrl: string): string {
    const itemUrl =
      item.contentType === 'blog'
        ? `${siteUrl}/blogs/${item.slug}`
        : item.contentType === 'project'
          ? `${siteUrl}/works/${item.slug}`
          : `${siteUrl}/research/${item.slug}`;

    const typeLabel =
      item.contentType === 'blog'
        ? 'New Article'
        : item.contentType === 'project'
          ? 'New Case Study'
          : 'New Research Paper';

    const ctaLabel =
      item.contentType === 'blog'
        ? 'Read Full Article &rarr;'
        : item.contentType === 'project'
          ? 'Explore Project &rarr;'
          : 'Read Research Paper &rarr;';

    const coverHtml = item.coverImageUrl
      ? `<div style="margin-bottom: 24px; text-align: center;">
          <img src="${item.coverImageUrl}" alt="${item.title}" style="max-width: 100%; border-radius: 8px; border: 1px solid #262626; display: block;" />
        </div>`
      : '';

    const metaParts: string[] = [];
    if (item.readingTimeMinutes) metaParts.push(`${item.readingTimeMinutes} min read`);
    if (item.categoryName) metaParts.push(item.categoryName);
    const metaHtml = metaParts.length > 0
      ? `<p style="margin: 0 0 12px 0; font-size: 11px; font-family: monospace; color: #ff8c42; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
          ${metaParts.join(' &bull; ')}
        </p>`
      : '';

    return `
      ${coverHtml}
      <div style="margin-bottom: 8px;">
        <span style="display: inline-block; background-color: rgba(255, 140, 66, 0.1); border: 1px solid rgba(255, 140, 66, 0.25); color: #ff8c42; font-size: 10px; font-family: monospace; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; font-weight: bold; margin-bottom: 12px;">
          ${typeLabel}
        </span>
      </div>
      <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
        ${item.title}
      </h1>
      ${metaHtml}
      <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #b4b4b4;">
        ${item.excerpt || 'A new release has just been published on the portfolio engineering dispatch.'}
      </p>
      <div style="margin: 28px 0 12px 0;">
        <a href="${itemUrl}" style="display: inline-block; background-color: #ff8c42; color: #000000; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 6px; text-align: center;">
          ${ctaLabel}
        </a>
      </div>
    `;
  },

  /** Asynchronously broadcast a newly published content item to all active confirmed subscribers. */
  async broadcastPublishedContent(item: BroadcastItemPayload): Promise<{ sent: number; failed: number }> {
    try {
      const subscribers = await newsletterRepository.findMany({
        isConfirmed: true,
        unsubscribedAt: null,
      });

      if (subscribers.length === 0) {
        logger.info({ title: item.title }, 'No confirmed newsletter subscribers found to broadcast to');
        return { sent: 0, failed: 0 };
      }

      const siteUrl = await emailService.resolveSiteUrl();
      const contentHtml = this.generateContentHtml(item, siteUrl);

      const typePrefix =
        item.contentType === 'blog'
          ? 'New Article'
          : item.contentType === 'project'
            ? 'New Project'
            : 'New Research Paper';

      const subject = `${typePrefix}: ${item.title}`;
      const previewText = item.excerpt || `Read the latest ${item.contentType} on the engineering dispatch.`;

      const recipients = subscribers.map((sub) => ({
        to: sub.email,
        variables: {
          name: sub.name || 'Reader',
          email: sub.email,
          unsubscribeUrl: `${siteUrl}/newsletter/unsubscribe?token=${sub.id}`,
        },
      }));

      const result = await emailService.sendBatchEmail({
        purpose: EMAIL_TEMPLATE_KEYS.NEWSLETTER_BROADCAST,
        recipients,
        commonVariables: {
          subject,
          previewText,
          contentHtml,
          siteUrl,
        },
      });

      logger.info(
        {
          contentType: item.contentType,
          title: item.title,
          sent: result.sent,
          failed: result.failed,
        },
        'Dispatched content publication newsletter broadcast to subscribers',
      );

      return result;
    } catch (err) {
      logger.error({ err, title: item.title }, 'Failed to broadcast published content to newsletter subscribers');
      return { sent: 0, failed: 0 };
    }
  },
};
