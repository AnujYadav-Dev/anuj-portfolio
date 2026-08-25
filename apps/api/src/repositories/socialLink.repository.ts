import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

export const socialLinkRepository = {
  async findAll(onlyEnabled = true) {
    return prisma.socialLink.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.socialLink.findUnique({ where: { id } });
  },

  async create(data: Prisma.SocialLinkCreateInput) {
    return prisma.socialLink.create({ data });
  },

  async update(id: string, data: Prisma.SocialLinkUpdateInput) {
    return prisma.socialLink.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.socialLink.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.socialLink.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
