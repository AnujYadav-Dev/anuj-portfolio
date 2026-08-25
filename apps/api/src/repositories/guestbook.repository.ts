import { prisma } from '@/config/prisma';
import type { ModerationStatus, Prisma } from '@prisma/client';

export const guestbookRepository = {
  async findMany(where?: Prisma.GuestbookEntryWhereInput, skip?: number, take?: number) {
    return prisma.guestbookEntry.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  },

  async count(where?: Prisma.GuestbookEntryWhereInput) {
    return prisma.guestbookEntry.count({ where });
  },

  async findById(id: string) {
    return prisma.guestbookEntry.findUnique({ where: { id } });
  },

  async create(data: Prisma.GuestbookEntryCreateInput) {
    return prisma.guestbookEntry.create({ data });
  },

  async updateModeration(id: string, status: ModerationStatus) {
    return prisma.guestbookEntry.update({
      where: { id },
      data: {
        moderationStatus: status,
        moderatedAt: new Date(),
      },
    });
  },

  async delete(id: string) {
    return prisma.guestbookEntry.delete({ where: { id } });
  },
};
