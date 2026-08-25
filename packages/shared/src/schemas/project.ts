// Project Zod validation schemas.

import { z } from 'zod';
import {
  slugSchema,
  paginationSchema,
  seoFieldsSchema,
  optionalDateStringSchema,
  optionalUuidSchema,
  optionalUrlSchema,
} from './common';
import { ContentStatus, ProjectType, ProjectStatus } from '../types/enums';

/** Create project request validation. */
export const createProjectSchema = z
  .object({
    title: z.string().min(1).max(300),
    slug: slugSchema,
    shortDescription: z.string().min(1),
    content: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    githubUrl: optionalUrlSchema,
    liveUrl: optionalUrlSchema,
    projectType: z.nativeEnum(ProjectType).default(ProjectType.Personal),
    projectStatus: z.nativeEnum(ProjectStatus).default(ProjectStatus.Completed),
    status: z.nativeEnum(ContentStatus).default(ContentStatus.Draft),
    isFeatured: z.boolean().default(false),
    startDate: optionalDateStringSchema,
    endDate: optionalDateStringSchema,
    categoryId: optionalUuidSchema,
    coverImageId: optionalUuidSchema,
    tagIds: z.array(z.string().uuid()).optional(),
  })
  .merge(seoFieldsSchema);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/** Update project request validation — all fields optional. */
export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/** List projects query parameters. */
export const listProjectsQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ContentStatus).optional(),
  projectType: z.nativeEnum(ProjectType).optional(),
  categoryId: z.string().uuid().optional(),
  tag: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  authorId: z.string().uuid().optional(),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

/** Create/update project category schema. */
export const upsertProjectCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertProjectCategoryInput = z.infer<typeof upsertProjectCategorySchema>;
