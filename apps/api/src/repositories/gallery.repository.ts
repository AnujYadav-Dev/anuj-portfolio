import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

const galleryInclude = {
  media: { select: { url: true, altText: true } },
};

export const galleryRepository = {
  async findAll(onlyEnabled = true, category?: string) {
    const where: Prisma.GalleryItemWhereInput = {};
    if (onlyEnabled) where.isEnabled = true;
    if (category) where.category = category;

    return prisma.galleryItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: galleryInclude,
    });
  },

  async findById(id: string) {
    return prisma.galleryItem.findUnique({
      where: { id },
      include: galleryInclude,
    });
  },

  async create(data: Prisma.GalleryItemUncheckedCreateInput) {
    return prisma.galleryItem.create({
      data,
      include: galleryInclude,
    });
  },

  async update(id: string, data: Prisma.GalleryItemUncheckedUpdateInput) {
    return prisma.galleryItem.update({
      where: { id },
      data,
      include: galleryInclude,
    });
  },

  async delete(id: string) {
    return prisma.galleryItem.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.galleryItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
