// Research paper DTOs and request types.

import type { ContentStatus } from './enums';
import type { SeoFields } from './common';

/** Full research paper representation. */
export interface ResearchPaperDto extends SeoFields {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  content: string | null;
  doi: string | null;
  publicationUrl: string | null;
  publicationName: string | null;
  publicationDate: string | null;
  status: ContentStatus;
  isFeatured: boolean;
  pdfUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  tags: string[];
}

/** Condensed research paper for list views. */
export interface ResearchPaperListItemDto {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  publicationName: string | null;
  publicationDate: string | null;
  status: ContentStatus;
  isFeatured: boolean;
  publishedAt: string | null;
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

/** Create research paper request payload. */
export interface CreateResearchPaperRequest {
  title: string;
  slug: string;
  abstract?: string;
  content?: string;
  doi?: string;
  publicationUrl?: string;
  publicationName?: string;
  publicationDate?: string;
  status?: ContentStatus;
  isFeatured?: boolean;
  pdfId?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageId?: string;
  tagIds?: string[];
  notifySubscribers?: boolean;
}

/** Update research paper request payload — all fields optional. */
export interface UpdateResearchPaperRequest extends Partial<CreateResearchPaperRequest> {}
