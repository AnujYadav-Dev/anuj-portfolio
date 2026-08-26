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

/** Update homepage section request. */
export interface UpdateHomepageSectionRequest {
  title?: string | null;
  isEnabled?: boolean;
  config?: Record<string, unknown>;
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

/** Create content block request. */
export interface CreateContentBlockRequest {
  blockType: BlockType;
  title?: string;
  content?: string;
  mediaUrl?: string;
  config?: Record<string, unknown>;
  sortOrder?: number;
  isEnabled?: boolean;
  pageId?: string;
  homepageSectionId?: string;
}

/** Update content block request. */
export interface UpdateContentBlockRequest extends Partial<CreateContentBlockRequest> {}

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

/** Create navigation item request. */
export interface CreateNavItemRequest {
  label: string;
  url: string;
  location?: NavLocation;
  isExternal?: boolean;
  sortOrder?: number;
  isEnabled?: boolean;
  parentId?: string | null;
}

/** Update navigation item request. */
export interface UpdateNavItemRequest extends Partial<CreateNavItemRequest> {}

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

/** Create page request payload. */
export interface CreatePageRequest {
  title: string;
  slug: string;
  content?: string;
  status?: ContentStatus;
  isNavVisible?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageId?: string;
}

/** Update page request payload. */
export interface UpdatePageRequest extends Partial<CreatePageRequest> {}

/** Email template DTO. */
export interface EmailTemplateDto {
  id: string;
  templateKey: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

/** Update email template request. */
export interface UpdateEmailTemplateRequest {
  subject?: string;
  bodyHtml?: string;
  bodyText?: string | null;
}

/** Standard site settings key constants and map. */
export interface SiteSettingsMap {
  site_title?: string;
  site_description?: string;
  site_url?: string;
  availability_status?: string;
  default_seo_title?: string;
  default_seo_description?: string;
  robots_indexing_enabled?: string;
  analytics_enabled?: string;
  twitter_handle?: string;
  author_name?: string;
  author_email?: string;
  author_job_title?: string;
  [key: string]: string | undefined;
}

/** Syndication RSS/Atom feed item. */
export interface SyndicationFeedItem {
  title: string;
  link: string;
  description: string;
  contentHtml?: string;
  pubDate: string;
  author: string;
  guid: string;
  category?: string;
}

