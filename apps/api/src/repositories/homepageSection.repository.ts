import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

const sectionDetailedInclude = {
  contentBlocks: {
    where: { isEnabled: true },
    orderBy: { sortOrder: 'asc' as const },
    include: {
      media: { select: { url: true } },
    },
  },
};

export const homepageSectionRepository = {
  async findAll(onlyEnabled = true) {
    return prisma.homepageSection.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: sectionDetailedInclude,
    });
  },

  async findById(id: string) {
    return prisma.homepageSection.findUnique({
      where: { id },
      include: sectionDetailedInclude,
    });
  },

  async findByKey(sectionKey: string) {
    return prisma.homepageSection.findUnique({
      where: { sectionKey },
      include: sectionDetailedInclude,
    });
  },

  async create(data: Prisma.HomepageSectionCreateInput) {
    return prisma.homepageSection.create({
      data,
      include: sectionDetailedInclude,
    });
  },

  async update(id: string, data: Prisma.HomepageSectionUpdateInput) {
    return prisma.homepageSection.update({
      where: { id },
      data,
      include: sectionDetailedInclude,
    });
  },

  async delete(id: string) {
    return prisma.homepageSection.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.homepageSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
