import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

const testimonialInclude = {
  authorAvatar: { select: { url: true } },
};

export const testimonialRepository = {
  async findAll(onlyEnabled = true, isFeatured?: boolean) {
    const where: Prisma.TestimonialWhereInput = {};
    if (onlyEnabled) where.isEnabled = true;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    return prisma.testimonial.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: testimonialInclude,
    });
  },

  async findById(id: string) {
    return prisma.testimonial.findUnique({
      where: { id },
      include: testimonialInclude,
    });
  },

  async create(data: Prisma.TestimonialUncheckedCreateInput) {
    return prisma.testimonial.create({
      data,
      include: testimonialInclude,
    });
  },

  async update(id: string, data: Prisma.TestimonialUncheckedUpdateInput) {
    return prisma.testimonial.update({
      where: { id },
      data,
      include: testimonialInclude,
    });
  },

  async delete(id: string) {
    return prisma.testimonial.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.testimonial.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
