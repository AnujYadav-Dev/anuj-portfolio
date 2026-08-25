import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

export const opensourceRepository = {
  async findAll(onlyEnabled = true, isFeatured?: boolean) {
    const where: Prisma.OpensourceContributionWhereInput = {};
    if (onlyEnabled) where.isEnabled = true;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    return prisma.opensourceContribution.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { stars: 'desc' }],
    });
  },

  async findById(id: string) {
    return prisma.opensourceContribution.findUnique({ where: { id } });
  },

  async create(data: Prisma.OpensourceContributionCreateInput) {
    return prisma.opensourceContribution.create({ data });
  },

  async update(id: string, data: Prisma.OpensourceContributionUpdateInput) {
    return prisma.opensourceContribution.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.opensourceContribution.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.opensourceContribution.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
