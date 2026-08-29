import { guestbookRepository } from '@/repositories/guestbook.repository';
import { siteSettingRepository } from '@/repositories/siteSetting.repository';
import { emailService } from '@/services/email.service';
import { activityLogService } from '@/services/activityLog.service';
import { mapGuestbookEntryToDto } from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { NotFoundError } from '@/utils/errors';
import { logger } from '@/config/logger';
import { EMAIL_TEMPLATE_KEYS } from '@portfolio/shared';
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

    // Notify Admin of new entry pending moderation
    setImmediate(async () => {
      try {
        const setting = await siteSettingRepository.findByKey(
          'email_notifications_guestbook_enabled',
        );
        if (setting && setting.value === 'false') return;

        const adminRecipients = await emailService.resolveAdminRecipients();
        const siteUrl = await emailService.resolveSiteUrl();
        for (const adminEmail of adminRecipients) {
          await emailService.sendTemplatedEmail({
            purpose: EMAIL_TEMPLATE_KEYS.GUESTBOOK_ADMIN_NOTIFICATION,
            to: adminEmail,
            variables: {
              authorName: input.authorName,
              authorEmail: input.authorEmail || 'None provided',
              message: input.message,
              adminUrl: `${siteUrl}/admin/guestbook`,
              submittedAt: new Date().toLocaleString(),
              siteUrl,
            },
          });
        }
      } catch (err) {
        logger.error({ err }, 'Error sending guestbook admin notification email');
      }
    });

    return mapGuestbookEntryToDto(created);
  },

  async moderateEntry(id: string, status: string): Promise<GuestbookEntryDto> {
    const entry = await guestbookRepository.findById(id);
    if (!entry) {
      throw new NotFoundError(`Guestbook entry '${id}' not found`);
    }
    const updated = await guestbookRepository.updateModeration(id, status as ModerationStatus);

    activityLogService.log({
      action: 'guestbook_moderate',
      entityType: 'guestbook_entry',
      entityId: id,
      details: { authorName: entry.authorName, moderationStatus: status },
    });

    // If entry was approved and author provided an email, send them a confirmation notification
    if (status === ModerationStatus.approved && entry.authorEmail) {
      setImmediate(async () => {
        try {
          const siteUrl = await emailService.resolveSiteUrl();
          await emailService.sendTemplatedEmail({
            purpose: EMAIL_TEMPLATE_KEYS.GUESTBOOK_APPROVED,
            to: entry.authorEmail!,
            variables: {
              authorName: entry.authorName,
              message: entry.message,
              guestbookUrl: `${siteUrl}/guestbook`,
              siteUrl,
            },
          });
        } catch (err) {
          logger.error(
            { err, email: entry.authorEmail },
            'Error sending guestbook approved notification email',
          );
        }
      });
    }

    return mapGuestbookEntryToDto(updated);
  },

  async deleteEntry(id: string): Promise<void> {
    const entry = await guestbookRepository.findById(id);
    if (!entry) {
      throw new NotFoundError(`Guestbook entry '${id}' not found`);
    }
    await guestbookRepository.delete(id);

    activityLogService.log({
      action: 'guestbook_delete',
      entityType: 'guestbook_entry',
      entityId: id,
      details: { authorName: entry.authorName },
    });
  },
};
