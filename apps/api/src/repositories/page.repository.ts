import { prisma } from '@/config/prisma';
import type { ContentStatus, Prisma } from '@prisma/client';

const pageDetailedInclude = {
  ogImage: { select: { url: true } },
  contentBlocks: {
    where: { isEnabled: true },
    orderBy: { sortOrder: 'asc' as const },
    include: {
      media: { select: { url: true } },
    },
  },
};

const pageAdminInclude = {
  ogImage: { select: { url: true } },
  contentBlocks: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      media: { select: { url: true } },
    },
  },
};

export interface FindPagesParams {
  where?: Prisma.PageWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.PageOrderByWithRelationInput;
}

export const pageRepository = {
  async findMany(params: FindPagesParams, isAdmin = false) {
    return prisma.page.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy ?? { sortOrder: 'asc' },
      include: isAdmin ? pageAdminInclude : pageDetailedInclude,
    });
  },

  async count(where?: Prisma.PageWhereInput) {
    return prisma.page.count({ where });
  },

  async findById(id: string, isAdmin = false) {
    return prisma.page.findUnique({
      where: { id },
      include: isAdmin ? pageAdminInclude : pageDetailedInclude,
    });
  },

  async findBySlug(slug: string, isAdmin = false) {
    return prisma.page.findUnique({
      where: { slug },
      include: isAdmin ? pageAdminInclude : pageDetailedInclude,
    });
  },

  async create(data: Prisma.PageUncheckedCreateInput) {
    return prisma.page.create({
      data,
      include: pageAdminInclude,
    });
  },

  async update(id: string, data: Prisma.PageUncheckedUpdateInput) {
    return prisma.page.update({
      where: { id },
      data,
      include: pageAdminInclude,
    });
  },

  async delete(id: string) {
    return prisma.page.delete({ where: { id } });
  },

  async updateStatus(id: string, status: ContentStatus, publishedAt?: Date | null) {
    return prisma.page.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'published' ? (publishedAt ?? new Date()) : publishedAt,
      },
      include: pageAdminInclude,
    });
  },
};
