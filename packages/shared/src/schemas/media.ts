// Media upload validation schemas.

import { z } from 'zod';

/** Optional metadata fields for media upload (multipart form fields). */
export const uploadMediaMetadataSchema = z.object({
  altText: z.string().max(500).optional(),
  caption: z.string().max(2000).optional(),
});

export type UploadMediaMetadataInput = z.infer<typeof uploadMediaMetadataSchema>;
