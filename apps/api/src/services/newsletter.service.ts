import { newsletterRepository } from '@/repositories/newsletter.repository';
import { mapNewsletterSubscriberToDto } from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { generateSecureToken } from '@/utils/hash';
import type {
  NewsletterSubscribeInput,
  NewsletterSubscriberDto,
  PaginatedResponse,
  PaginationQuery,
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
        throw new ConflictError(`Email '${input.email}' is already subscribed`);
      }
    }

    const token = generateSecureToken();
    await newsletterRepository.create(input.email, input.name ?? null, token);

    return { message: 'Subscribed successfully' };
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
    query: PaginationQuery & { isConfirmed?: boolean },
  ): Promise<PaginatedResponse<NewsletterSubscriberDto>> {
    const where: Prisma.NewsletterSubscriberWhereInput = {
      unsubscribedAt: null,
    };
    if (query.isConfirmed !== undefined) where.isConfirmed = query.isConfirmed;

    const { skip, take } = getPrismaPagination(query, 'createdAt');
    const [items, totalItems] = await Promise.all([
      newsletterRepository.findMany(where, skip, take),
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
