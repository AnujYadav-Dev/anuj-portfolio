import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

export const skillRepository = {
  async findMany(where?: Prisma.SkillWhereInput) {
    return prisma.skill.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.skill.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  },

  async findBySlugAndCategory(categoryId: string, slug: string) {
    return prisma.skill.findUnique({
      where: {
        categoryId_slug: { categoryId, slug },
      },
    });
  },

  async create(data: Prisma.SkillUncheckedCreateInput) {
    return prisma.skill.create({ data });
  },

  async update(id: string, data: Prisma.SkillUncheckedUpdateInput) {
    return prisma.skill.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.skill.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.skill.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
