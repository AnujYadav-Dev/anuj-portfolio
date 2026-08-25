// Media DTOs.

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

/** Query parameters for listing media assets. */
export interface ListMediaQuery {
  page?: number;
  pageSize?: number;
  mediaType?: MediaType;
  search?: string;
}

/** Update media metadata request. */
export interface UpdateMediaRequest {
  filename?: string;
  altText?: string | null;
  caption?: string | null;
}
