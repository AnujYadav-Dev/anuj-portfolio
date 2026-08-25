import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

export const skillCategoryRepository = {
  async findAllWithSkills(onlyEnabled = true) {
    return prisma.skillCategory.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: {
        skills: {
          where: onlyEnabled ? { isEnabled: true } : undefined,
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.skillCategory.findUnique({
      where: { id },
      include: {
        skills: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.skillCategory.findUnique({ where: { slug } });
  },

  async create(data: Prisma.SkillCategoryCreateInput) {
    return prisma.skillCategory.create({
      data,
      include: { skills: true },
    });
  },

  async update(id: string, data: Prisma.SkillCategoryUpdateInput) {
    return prisma.skillCategory.update({
      where: { id },
      data,
      include: { skills: true },
    });
  },

  async delete(id: string) {
    return prisma.skillCategory.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.skillCategory.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
