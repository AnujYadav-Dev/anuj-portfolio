import { prisma } from '@/config/prisma';
import type { Prisma, TimelineEventType } from '@prisma/client';

export const timelineRepository = {
  async findAll(onlyEnabled = true, eventType?: TimelineEventType) {
    const where: Prisma.TimelineEventWhereInput = {};
    if (onlyEnabled) where.isEnabled = true;
    if (eventType) where.eventType = eventType;

    return prisma.timelineEvent.findMany({
      where,
      orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }],
    });
  },

  async findById(id: string) {
    return prisma.timelineEvent.findUnique({ where: { id } });
  },

  async create(data: Prisma.TimelineEventCreateInput) {
    return prisma.timelineEvent.create({ data });
  },

  async update(id: string, data: Prisma.TimelineEventUpdateInput) {
    return prisma.timelineEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.timelineEvent.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.timelineEvent.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
