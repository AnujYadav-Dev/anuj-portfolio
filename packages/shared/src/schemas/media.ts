// Media upload & management validation schemas.

import { z } from 'zod';
import { MediaType } from '../types/enums';
import { paginationSchema } from './common';

/** Optional metadata fields for media upload (multipart form fields). */
export const uploadMediaMetadataSchema = z.object({
  altText: z.string().max(500).optional(),
  caption: z.string().max(2000).optional(),
});

export type UploadMediaMetadataInput = z.infer<typeof uploadMediaMetadataSchema>;

/** Query parameters for listing media library assets. */
export const listMediaSchema = paginationSchema.extend({
  mediaType: z.nativeEnum(MediaType).optional(),
  search: z.string().optional(),
});

export type ListMediaInput = z.infer<typeof listMediaSchema>;

/** Update media metadata schema. */
export const updateMediaSchema = z.object({
  filename: z.string().min(1).max(255).optional(),
  altText: z.string().max(500).nullable().optional(),
  caption: z.string().max(2000).nullable().optional(),
});

export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
