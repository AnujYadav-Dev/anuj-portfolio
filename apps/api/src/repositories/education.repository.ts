import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

const educationInclude = {
  institutionLogo: { select: { url: true } },
};

export const educationRepository = {
  async findAll(onlyEnabled = true) {
    return prisma.education.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
      include: educationInclude,
    });
  },

  async findById(id: string) {
    return prisma.education.findUnique({
      where: { id },
      include: educationInclude,
    });
  },

  async create(data: Prisma.EducationUncheckedCreateInput) {
    return prisma.education.create({
      data,
      include: educationInclude,
    });
  },

  async update(id: string, data: Prisma.EducationUncheckedUpdateInput) {
    return prisma.education.update({
      where: { id },
      data,
      include: educationInclude,
    });
  },

  async delete(id: string) {
    return prisma.education.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.education.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
