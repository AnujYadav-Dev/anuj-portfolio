// Media DTO.

import type { MediaType } from './enums';

/** Media asset DTO. */
export interface MediaDto {
  id: string;
  filename: string;
  url: string;
  mediaType: MediaType;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  createdAt: string;
}
