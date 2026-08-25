import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

const experienceInclude = {
  companyLogo: { select: { url: true } },
};

export const experienceRepository = {
  async findAll(onlyEnabled = true) {
    return prisma.experience.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
      include: experienceInclude,
    });
  },

  async findById(id: string) {
    return prisma.experience.findUnique({
      where: { id },
      include: experienceInclude,
    });
  },

  async create(data: Prisma.ExperienceUncheckedCreateInput) {
    return prisma.experience.create({
      data,
      include: experienceInclude,
    });
  },

  async update(id: string, data: Prisma.ExperienceUncheckedUpdateInput) {
    return prisma.experience.update({
      where: { id },
      data,
      include: experienceInclude,
    });
  },

  async delete(id: string) {
    return prisma.experience.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.experience.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
