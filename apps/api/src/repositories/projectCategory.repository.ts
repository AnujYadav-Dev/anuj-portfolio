import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

export const projectCategoryRepository = {
  async findAll(onlyEnabled = true) {
    return prisma.projectCategory.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.projectCategory.findUnique({ where: { id } });
  },

  async findBySlug(slug: string) {
    return prisma.projectCategory.findUnique({ where: { slug } });
  },

  async create(data: Prisma.ProjectCategoryCreateInput) {
    return prisma.projectCategory.create({ data });
  },

  async update(id: string, data: Prisma.ProjectCategoryUpdateInput) {
    return prisma.projectCategory.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.projectCategory.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.projectCategory.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
