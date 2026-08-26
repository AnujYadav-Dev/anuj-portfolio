import { prisma } from '@/config/prisma';
import type { NavLocation, Prisma } from '@prisma/client';

const navItemInclude = {
  children: {
    where: { isEnabled: true },
    orderBy: { sortOrder: 'asc' as const },
    include: {
      children: {
        where: { isEnabled: true },
        orderBy: { sortOrder: 'asc' as const },
        include: {
          children: {
            where: { isEnabled: true },
            orderBy: { sortOrder: 'asc' as const },
          },
        },
      },
    },
  },
};

const navItemAdminInclude = {
  children: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      children: {
        orderBy: { sortOrder: 'asc' as const },
        include: {
          children: {
            orderBy: { sortOrder: 'asc' as const },
          },
        },
      },
    },
  },
};


export const navItemRepository = {
  async findTree(location?: NavLocation, onlyEnabled = true) {
    const where: Prisma.NavItemWhereInput = {
      parentId: null, // top-level items
    };
    if (onlyEnabled) where.isEnabled = true;
    if (location) {
      where.OR = [{ location }, { location: 'both' }];
    }

    return prisma.navItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: onlyEnabled ? navItemInclude : navItemAdminInclude,
    });
  },

  async findAllFlat() {
    return prisma.navItem.findMany({
      orderBy: [{ location: 'asc' }, { sortOrder: 'asc' }],
    });
  },

  async findById(id: string) {
    return prisma.navItem.findUnique({
      where: { id },
      include: navItemAdminInclude,
    });
  },

  async create(data: Prisma.NavItemUncheckedCreateInput) {
    return prisma.navItem.create({
      data,
      include: navItemAdminInclude,
    });
  },

  async update(id: string, data: Prisma.NavItemUncheckedUpdateInput) {
    return prisma.navItem.update({
      where: { id },
      data,
      include: navItemAdminInclude,
    });
  },

  async delete(id: string) {
    return prisma.navItem.delete({ where: { id } });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.navItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
