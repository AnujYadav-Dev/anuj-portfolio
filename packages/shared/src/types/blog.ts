// Blog post DTOs and request types.

import type { ContentStatus } from './enums';
import type { SeoFields } from './common';

/** Full blog post representation. */
export interface BlogPostDto extends SeoFields {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  readingTimeMinutes: number | null;
  status: ContentStatus;
  isFeatured: boolean;
  coverImageUrl: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: string[];
}

/** Condensed blog post for list views. */
export interface BlogPostListItemDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  readingTimeMinutes: number | null;
  status: ContentStatus;
  isFeatured: boolean;
  coverImageUrl: string | null;
  publishedAt: string | null;
  author: {
    username: string;
    displayName: string;
  };
  category: {
    name: string;
    slug: string;
  } | null;
}

/** Create blog post request payload. */
export interface CreateBlogPostRequest {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  readingTimeMinutes?: number;
  status?: ContentStatus;
  isFeatured?: boolean;
  categoryId?: string;
  coverImageId?: string;
  publishedAt?: string;
  scheduledAt?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageId?: string;
  tagIds?: string[];
  notifySubscribers?: boolean;
}

/** Update blog post request payload — all fields optional. */
export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {}

/** Blog category DTO. */
export interface BlogCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isEnabled: boolean;
}
