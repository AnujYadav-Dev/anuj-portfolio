// Tag DTOs and request types.

import type { EntityType } from './enums';

/** Tag DTO. */
export interface TagDto {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

/** Tag with usage count DTO. */
export interface TagWithCountDto extends TagDto {
  count: number;
}

/** Create tag request payload. */
export interface CreateTagRequest {
  name: string;
  slug?: string;
}

/** Update tag request payload. */
export interface UpdateTagRequest {
  name?: string;
  slug?: string;
}

/** Entity tag association DTO. */
export interface EntityTagDto {
  id: string;
  tagId: string;
  entityType: EntityType;
  entityId: string;
  tag: TagDto;
}
