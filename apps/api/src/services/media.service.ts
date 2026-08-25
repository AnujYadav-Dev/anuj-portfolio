import { imageSize } from 'image-size';
import type { UploadMediaMetadataInput, ListMediaInput, UpdateMediaInput } from '@portfolio/shared';
import { mediaRepository } from '@/repositories/media.repository';
import { getStorageAdapter } from '@/storage';
import { generateStoredFilename } from '@/utils/hash';
import {
  mapMediaToDto,
  mimeTypeToMediaType,
} from '@/utils/mappers';
import { ValidationError, NotFoundError } from '@/utils/errors';
import { ALLOWED_UPLOAD_MIME_TYPES } from '@/config/constants';
import { getPrismaPagination, buildPagination } from '@/utils/pagination';


export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export const mediaService = {
  async upload(
    file: UploadedFile,
    metadata: UploadMediaMetadataInput,
    uploadedBy: string,
  ) {
    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number])) {
      throw new ValidationError('Unsupported file type', {
        mimetype: [`File type '${file.mimetype}' is not allowed`],
      });
    }

    const storedFilename = generateStoredFilename(file.originalname);
    const adapter = getStorageAdapter();
    const stored = await adapter.save(file.buffer, storedFilename, file.mimetype);

    let width: number | null = null;
    let height: number | null = null;

    if (
      file.mimetype.startsWith('image/') &&
      file.mimetype !== 'image/svg+xml'
    ) {
      try {
        const dimensions = imageSize(new Uint8Array(file.buffer));
        width = dimensions.width ?? null;
        height = dimensions.height ?? null;
      } catch {
        width = null;
        height = null;
      }
    }

    const media = await mediaRepository.create({
      filename: file.originalname,
      url: stored.url,
      mediaType: mimeTypeToMediaType(file.mimetype),
      mimeType: file.mimetype,
      sizeBytes: file.size,
      width,
      height,
      altText: metadata.altText ?? null,
      caption: metadata.caption ?? null,
      uploadedBy,
    });

    return mapMediaToDto(media);
  },

  async list(query: ListMediaInput) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;
    const { skip, take } = getPrismaPagination({ page, pageSize });

    const [items, total] = await Promise.all([
      mediaRepository.findMany({
        skip,
        take,
        mediaType: query.mediaType as any,
        search: query.search,
      }),
      mediaRepository.count({
        mediaType: query.mediaType as any,
        search: query.search,
      }),
    ]);

    return {
      data: items.map(mapMediaToDto),
      pagination: buildPagination(page, pageSize, total),
    };

  },

  async getById(id: string) {
    const media = await mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundError('Media not found');
    }
    return mapMediaToDto(media);
  },

  async update(id: string, input: UpdateMediaInput) {
    const existing = await mediaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Media not found');
    }

    const updated = await mediaRepository.update(id, input);
    return mapMediaToDto(updated);
  },

  async delete(id: string) {
    const existing = await mediaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Media not found');
    }

    // Try deleting physical file from storage adapter
    const adapter = getStorageAdapter();
    if (adapter.delete) {
      await adapter.delete(existing.url);
    }

    await mediaRepository.delete(id);
  },
};
