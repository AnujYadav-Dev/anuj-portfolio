import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

export const aboutSectionRepository = {
  async findAll(onlyEnabled = true) {
    return prisma.aboutSection.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.aboutSection.findUnique({ where: { id } });
  },

  async findBySlug(slug: string) {
    return prisma.aboutSection.findUnique({ where: { slug } });
  },

  async create(data: Prisma.AboutSectionCreateInput) {
    return prisma.aboutSection.create({ data });
  },

  async update(id: string, data: Prisma.AboutSectionUpdateInput) {
    return prisma.aboutSection.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.aboutSection.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.aboutSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
