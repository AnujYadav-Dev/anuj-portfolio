import { newsletterRepository } from '@/repositories/newsletter.repository';
import { mapNewsletterSubscriberToDto } from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { generateSecureToken } from '@/utils/hash';
import type {
  ListNewsletterSubscribersQuery,
  NewsletterSubscribeInput,
  NewsletterSubscriberDto,
  PaginatedResponse,
} from '@portfolio/shared';

import type { Prisma } from '@prisma/client';

export const newsletterService = {
  async subscribe(input: NewsletterSubscribeInput): Promise<{ message: string }> {
    const existing = await newsletterRepository.findByEmail(input.email);
    if (existing) {
      if (existing.unsubscribedAt) {
        // Resubscribe
        await newsletterRepository.delete(existing.id);
      } else {
        return { message: 'You are already subscribed to the newsletter!' };
      }
    }

    const token = generateSecureToken();
    await newsletterRepository.create(input.email, input.name ?? null, token);

    return { message: 'Subscribed successfully! Check your inbox.' };
  },

  async confirm(token: string): Promise<{ message: string }> {
    const subscriber = await newsletterRepository.confirm(token);
    if (!subscriber) {
      throw new NotFoundError('Invalid or expired confirmation token');
    }
    return { message: 'Newsletter subscription confirmed' };
  },

  async unsubscribe(tokenOrEmail: string): Promise<{ message: string }> {
    const subscriber = await newsletterRepository.unsubscribe(tokenOrEmail);
    if (!subscriber) {
      throw new NotFoundError('Subscriber not found');
    }
    return { message: 'Unsubscribed successfully' };
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
  },
};
