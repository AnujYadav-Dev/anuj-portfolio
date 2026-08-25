import { guestbookRepository } from '@/repositories/guestbook.repository';
import { mapGuestbookEntryToDto } from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { NotFoundError } from '@/utils/errors';
import type {
  CreateGuestbookEntryInput,
  GuestbookEntryDto,
  ListGuestbookAdminQuery,
  PaginatedResponse,
  PaginationQuery,
} from '@portfolio/shared';
import { ModerationStatus, type Prisma } from '@prisma/client';

export const guestbookService = {
  async listApprovedEntries(query: PaginationQuery): Promise<PaginatedResponse<GuestbookEntryDto>> {
    const where: Prisma.GuestbookEntryWhereInput = {
      moderationStatus: ModerationStatus.approved,
    };

    const { skip, take, orderBy } = getPrismaPagination(query, 'createdAt');
    const [items, totalItems] = await Promise.all([
      guestbookRepository.findMany(where, skip, take, orderBy as any),
      guestbookRepository.count(where),
    ]);

    return {
      data: items.map(mapGuestbookEntryToDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async listAdminEntries(
    query: ListGuestbookAdminQuery,
  ): Promise<PaginatedResponse<GuestbookEntryDto>> {
    const where: Prisma.GuestbookEntryWhereInput = {};
    const status = query.status || query.moderationStatus;
    if (status) {
      where.moderationStatus = status as ModerationStatus;
    }

    if (query.search) {
      where.OR = [
        { authorName: { contains: query.search, mode: 'insensitive' } },
        { authorEmail: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { skip, take, orderBy } = getPrismaPagination(query, 'createdAt');
    const [items, totalItems] = await Promise.all([
      guestbookRepository.findMany(where, skip, take, orderBy as any),
      guestbookRepository.count(where),
    ]);

    return {
      data: items.map(mapGuestbookEntryToDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async createEntry(
    input: CreateGuestbookEntryInput,
    ipAddress?: string | null,
  ): Promise<GuestbookEntryDto> {
    const created = await guestbookRepository.create({
      authorName: input.authorName,
      authorEmail: input.authorEmail ?? null,
      message: input.message,
      moderationStatus: ModerationStatus.pending,
      ipAddress: ipAddress ?? null,
    });
    return mapGuestbookEntryToDto(created);
  },

  async moderateEntry(id: string, status: string): Promise<GuestbookEntryDto> {
    const entry = await guestbookRepository.findById(id);
    if (!entry) {
      throw new NotFoundError(`Guestbook entry '${id}' not found`);
    }
    const updated = await guestbookRepository.updateModeration(id, status as ModerationStatus);
    return mapGuestbookEntryToDto(updated);
  },

  async deleteEntry(id: string): Promise<void> {
    const entry = await guestbookRepository.findById(id);
    if (!entry) {
      throw new NotFoundError(`Guestbook entry '${id}' not found`);
    }
    await guestbookRepository.delete(id);
  },
};
