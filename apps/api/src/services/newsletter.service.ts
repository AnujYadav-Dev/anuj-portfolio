import { newsletterRepository } from '@/repositories/newsletter.repository';
import { siteSettingRepository } from '@/repositories/siteSetting.repository';
import { emailService } from '@/services/email.service';
import { activityLogService } from '@/services/activityLog.service';
import { mapNewsletterSubscriberToDto } from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { generateSecureToken } from '@/utils/hash';
import { logger } from '@/config/logger';
import { EMAIL_TEMPLATE_KEYS } from '@portfolio/shared';
import type {
  ListNewsletterSubscribersQuery,
  NewsletterBroadcastInput,
  NewsletterSubscribeInput,
  NewsletterSubscriberDto,
  PaginatedResponse,
} from '@portfolio/shared';

import type { Prisma } from '@prisma/client';

export const newsletterService = {
  async subscribe(
    input: NewsletterSubscribeInput,
  ): Promise<{ message: string; requiresConfirmation: boolean }> {
    const existing = await newsletterRepository.findByEmail(input.email);
    if (existing) {
      if (existing.unsubscribedAt) {
        // Resubscribe cleanly
        await newsletterRepository.delete(existing.id);
      } else if (existing.isConfirmed) {
        return {
          message: 'You are already subscribed to the newsletter!',
          requiresConfirmation: false,
        };
      } else {
        // Already pending - re-issue verification email
        const token = existing.confirmationToken || generateSecureToken();
        const siteUrl = await emailService.resolveSiteUrl();
        const confirmationUrl = `${siteUrl}/newsletter/confirm?token=${token}`;

        try {
          await emailService.sendTemplatedEmail({
            purpose: EMAIL_TEMPLATE_KEYS.NEWSLETTER_CONFIRMATION,
            to: input.email,
            variables: {
              name: existing.name || input.name || 'Friend',
              email: input.email,
              confirmationUrl,
              siteUrl,
            },
          });
        } catch (err) {
          logger.error(
            { err, email: input.email },
            'Failed to re-send newsletter confirmation email',
          );
        }

        return {
          message: 'A confirmation link has been resent to your email address.',
          requiresConfirmation: true,
        };
      }
    }

    const doubleOptInSetting = await siteSettingRepository.findByKey('newsletter_double_opt_in');
    const isDoubleOptIn = !doubleOptInSetting || doubleOptInSetting.value !== 'false';

    const token = isDoubleOptIn ? generateSecureToken() : null;
    const subscriber = await newsletterRepository.create(input.email, input.name ?? null, token);

    const displayName = input.name || 'Reader';
    const siteUrl = await emailService.resolveSiteUrl();

    if (isDoubleOptIn && token) {
      const confirmationUrl = `${siteUrl}/newsletter/confirm?token=${token}`;

      // 1. Send confirmation link to subscriber
      try {
        await emailService.sendTemplatedEmail({
          purpose: EMAIL_TEMPLATE_KEYS.NEWSLETTER_CONFIRMATION,
          to: input.email,
          variables: {
            name: displayName,
            email: input.email,
            confirmationUrl,
            siteUrl,
          },
        });
      } catch (err) {
        logger.error({ err, email: input.email }, 'Failed to send newsletter confirmation email');
      }

      // 2. Send admin alert
      this.sendAdminNotification(input.email, displayName, 'Pending Confirmation (Double Opt-In)');

      return {
        message: 'Almost there! Please check your inbox and confirm your subscription.',
        requiresConfirmation: true,
      };
    } else {
      // Single Opt-In: Send welcome email immediately
      const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${subscriber.id}`;
      try {
        await emailService.sendTemplatedEmail({
          purpose: EMAIL_TEMPLATE_KEYS.NEWSLETTER_WELCOME,
          to: input.email,
          variables: {
            name: displayName,
            email: input.email,
            unsubscribeUrl,
            siteUrl,
          },
        });
      } catch (err) {
        logger.error({ err, email: input.email }, 'Failed to send newsletter welcome email');
      }

      // Send admin alert
      this.sendAdminNotification(input.email, displayName, 'Active / Confirmed (Single Opt-In)');

      return {
        message: 'Welcome aboard! You have been subscribed successfully.',
        requiresConfirmation: false,
      };
    }
  },

  async confirm(token: string): Promise<{ message: string; email: string }> {
    if (!token || !token.trim() || token === 'undefined' || token === 'null') {
      throw new ValidationError('Confirmation token is required');
    }

    const result = await newsletterRepository.confirm(token.trim());
    if (!result) {
      throw new NotFoundError('Invalid or expired confirmation token');
    }

    const { subscriber, isNewlyConfirmed } = result;

    if (isNewlyConfirmed) {
      const siteUrl = await emailService.resolveSiteUrl();
      const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${subscriber.id}`;
      const displayName = subscriber.name || 'Reader';

      // Send Welcome Email upon first confirmation
      try {
        await emailService.sendTemplatedEmail({
          purpose: EMAIL_TEMPLATE_KEYS.NEWSLETTER_WELCOME,
          to: subscriber.email,
          variables: {
            name: displayName,
            email: subscriber.email,
            unsubscribeUrl,
            siteUrl,
          },
        });
      } catch (err) {
        logger.error(
          { err, email: subscriber.email },
          'Failed to send newsletter welcome email after confirmation',
        );
      }
    }

    return {
      message: isNewlyConfirmed
        ? 'Newsletter subscription confirmed successfully!'
        : 'Your subscription is already confirmed!',
      email: subscriber.email,
    };
  },

  async unsubscribe(tokenOrEmail: string): Promise<{ message: string }> {
    const subscriber = await newsletterRepository.unsubscribe(tokenOrEmail);
    if (!subscriber) {
      throw new NotFoundError('Subscriber not found');
    }
    return { message: 'Unsubscribed successfully' };
  },

  async broadcast(
    input: NewsletterBroadcastInput,
  ): Promise<{ message: string; sent: number; failed: number }> {
    const subscribers = await newsletterRepository.findMany({
      isConfirmed: true,
      unsubscribedAt: null,
    });

    if (subscribers.length === 0) {
      throw new ValidationError(
        'No active confirmed newsletter subscribers found to broadcast to.',
      );
    }

    const siteUrl = await emailService.resolveSiteUrl();
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
        subject: input.subject,
        previewText: input.previewText || input.subject,
        contentHtml: input.contentHtml,
        siteUrl,
      },
    });

    activityLogService.log({
      action: 'newsletter_broadcast',
      entityType: 'newsletter_subscriber',
      details: { subject: input.subject, sentCount: result.sent, failedCount: result.failed },
    });

    return {
      message: `Broadcast sent to ${result.sent} subscriber(s) (${result.failed} failed).`,
      sent: result.sent,
      failed: result.failed,
    };
  },

  async listSubscribers(
    query: ListNewsletterSubscribersQuery,
  ): Promise<PaginatedResponse<NewsletterSubscriberDto>> {
    const where: Prisma.NewsletterSubscriberWhereInput = {};

    if (query.status === 'confirmed' || query.isConfirmed === true) {
      where.isConfirmed = true;
      where.unsubscribedAt = null;
    } else if (query.status === 'pending' || query.isConfirmed === false) {
      where.isConfirmed = false;
      where.unsubscribedAt = null;
    } else if (query.status === 'unsubscribed') {
      where.unsubscribedAt = { not: null };
    } else {
      // Default 'all' active subscribers
      where.unsubscribedAt = null;
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { skip, take, orderBy } = getPrismaPagination(query, 'createdAt');
    const [items, totalItems] = await Promise.all([
      newsletterRepository.findMany(where, skip, take, orderBy as any),
      newsletterRepository.count(where),
    ]);

    return {
      data: items.map(mapNewsletterSubscriberToDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async exportSubscribers(): Promise<NewsletterSubscriberDto[]> {
    const subscribers = await newsletterRepository.findMany({ unsubscribedAt: null });
    return subscribers.map(mapNewsletterSubscriberToDto);
  },

  async deleteSubscriber(id: string): Promise<void> {
    const subscriber = await newsletterRepository.findById(id);
    if (!subscriber) {
      throw new NotFoundError(`Subscriber '${id}' not found`);
    }
    await newsletterRepository.delete(id);

    activityLogService.log({
      action: 'newsletter_subscriber_delete',
      entityType: 'newsletter_subscriber',
      entityId: id,
      details: { email: subscriber.email, name: subscriber.name },
    });
  },

  sendAdminNotification(email: string, name: string, status: string): void {
    setImmediate(async () => {
      try {
        const setting = await siteSettingRepository.findByKey(
          'email_notifications_newsletter_enabled',
        );
        if (setting && setting.value === 'false') return;

        const adminRecipients = await emailService.resolveAdminRecipients();
        const siteUrl = await emailService.resolveSiteUrl();
        for (const adminEmail of adminRecipients) {
          await emailService.sendTemplatedEmail({
            purpose: EMAIL_TEMPLATE_KEYS.NEWSLETTER_ADMIN_NOTIFICATION,
            to: adminEmail,
            variables: {
              email,
              name,
              isConfirmed: status,
              subscribedAt: new Date().toLocaleString(),
              siteUrl,
            },
          });
        }
      } catch (err) {
        logger.error({ err }, 'Error sending newsletter admin notification email');
      }
    });
  },
};
