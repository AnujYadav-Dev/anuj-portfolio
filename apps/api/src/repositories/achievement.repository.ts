import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

const achievementInclude = {
  image: { select: { url: true } },
};

export const achievementRepository = {
  async findAll(onlyEnabled = true, isFeatured?: boolean) {
    const where: Prisma.AchievementWhereInput = {};
    if (onlyEnabled) where.isEnabled = true;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    return prisma.achievement.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }],
      include: achievementInclude,
    });
  },

  async findById(id: string) {
    return prisma.achievement.findUnique({
      where: { id },
      include: achievementInclude,
    });
  },

  async create(data: Prisma.AchievementUncheckedCreateInput) {
    return prisma.achievement.create({
      data,
      include: achievementInclude,
    });
  },

  async update(id: string, data: Prisma.AchievementUncheckedUpdateInput) {
    return prisma.achievement.update({
      where: { id },
      data,
      include: achievementInclude,
    });
  },

  async delete(id: string) {
    return prisma.achievement.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.achievement.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
