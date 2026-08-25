import { prisma } from '@/config/prisma';
import type { MediaType, Prisma } from '@prisma/client';

export interface CreateMediaData {
  filename: string;
  url: string;
  mediaType: MediaType;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  uploadedBy: string;
}

export const mediaRepository = {
  async create(data: CreateMediaData) {
    return prisma.media.create({ data });
  },

  async findMany(options: { skip: number; take: number; mediaType?: MediaType; search?: string }) {
    const where: Prisma.MediaWhereInput = {};

    if (options.mediaType) {
      where.mediaType = options.mediaType;
    }

    if (options.search) {
      where.OR = [
        { filename: { contains: options.search, mode: 'insensitive' } },
        { altText: { contains: options.search, mode: 'insensitive' } },
        { caption: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    return prisma.media.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { createdAt: 'desc' },
    });
  },

  async count(options: { mediaType?: MediaType; search?: string }) {
    const where: Prisma.MediaWhereInput = {};

    if (options.mediaType) {
      where.mediaType = options.mediaType;
    }

    if (options.search) {
      where.OR = [
        { filename: { contains: options.search, mode: 'insensitive' } },
        { altText: { contains: options.search, mode: 'insensitive' } },
        { caption: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    return prisma.media.count({ where });
  },

  async findById(id: string) {
    return prisma.media.findUnique({ where: { id } });
  },

  async update(
    id: string,
    data: {
      filename?: string;
      altText?: string | null;
      caption?: string | null;
    },
  ) {
    return prisma.media.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.media.delete({ where: { id } });
  },
};
