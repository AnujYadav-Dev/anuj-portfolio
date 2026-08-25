// Project DTOs and request types.

import type { ContentStatus, ProjectType, ProjectStatus } from './enums';
import type { SeoFields } from './common';

/** Full project representation. */
export interface ProjectDto extends SeoFields {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string | null;
  technologies: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  projectType: ProjectType;
  projectStatus: ProjectStatus;
  status: ContentStatus;
  isFeatured: boolean;
  startDate: string | null;
  endDate: string | null;
  sortOrder: number;
  coverImageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: string[];
}

/** Condensed project for list views. */
export interface ProjectListItemDto {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  technologies: string[];
  projectType: ProjectType;
  projectStatus: ProjectStatus;
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

/** Create project request payload. */
export interface CreateProjectRequest {
  title: string;
  slug: string;
  shortDescription: string;
  content?: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  projectType?: ProjectType;
  projectStatus?: ProjectStatus;
  status?: ContentStatus;
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  coverImageId?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageId?: string;
  tagIds?: string[];
}

/** Update project request payload — all fields optional. */
export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

/** Project category DTO. */
export interface ProjectCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isEnabled: boolean;
}
