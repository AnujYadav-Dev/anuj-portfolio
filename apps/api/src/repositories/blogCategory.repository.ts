import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

export const blogCategoryRepository = {
  async findAll(onlyEnabled = true) {
    return prisma.blogCategory.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.blogCategory.findUnique({ where: { id } });
  },

  async findBySlug(slug: string) {
    return prisma.blogCategory.findUnique({ where: { slug } });
  },

  async create(data: Prisma.BlogCategoryCreateInput) {
    return prisma.blogCategory.create({ data });
  },

  async update(id: string, data: Prisma.BlogCategoryUpdateInput) {
    return prisma.blogCategory.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.blogCategory.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.blogCategory.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
