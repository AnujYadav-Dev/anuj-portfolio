// Site configuration, layout, and navigation DTOs.

import type { ContentStatus, BlockType, NavLocation } from './enums';
import type { SeoFields } from './common';

/** Site setting DTO. */
export interface SiteSettingDto {
  id: string;
  key: string;
  value: string;
  group: string;
}

/** Homepage section DTO. */
export interface HomepageSectionDto {
  id: string;
  sectionKey: string;
  title: string | null;
  sortOrder: number;
  isEnabled: boolean;
  config: Record<string, unknown>;
}

/** Content block DTO. */
export interface ContentBlockDto {
  id: string;
  blockType: BlockType;
  title: string | null;
  content: string | null;
  mediaUrl: string | null;
  config: Record<string, unknown>;
  sortOrder: number;
  isEnabled: boolean;
  pageId: string | null;
  homepageSectionId: string | null;
}

/** Navigation item DTO. */
export interface NavItemDto {
  id: string;
  label: string;
  url: string;
  location: NavLocation;
  isExternal: boolean;
  sortOrder: number;
  isEnabled: boolean;
  parentId: string | null;
  children: NavItemDto[];
}

/** Dynamic page DTO. */
export interface PageDto extends SeoFields {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: ContentStatus;
  isNavVisible: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contentBlocks: ContentBlockDto[];
}
