import { prisma } from '@/config/prisma';
import type { MediaType } from '@prisma/client';

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
};
