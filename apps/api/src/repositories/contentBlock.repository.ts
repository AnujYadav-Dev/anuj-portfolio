import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

const blockDetailedInclude = {
  media: { select: { url: true } },
};

export const contentBlockRepository = {
  async findMany(where?: Prisma.ContentBlockWhereInput) {
    return prisma.contentBlock.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: blockDetailedInclude,
    });
  },

  async findById(id: string) {
    return prisma.contentBlock.findUnique({
      where: { id },
      include: blockDetailedInclude,
    });
  },

  async create(data: Prisma.ContentBlockUncheckedCreateInput) {
    return prisma.contentBlock.create({
      data,
      include: blockDetailedInclude,
    });
  },

  async update(id: string, data: Prisma.ContentBlockUncheckedUpdateInput) {
    return prisma.contentBlock.update({
      where: { id },
      data,
      include: blockDetailedInclude,
    });
  },

  async delete(id: string) {
    return prisma.contentBlock.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.contentBlock.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
