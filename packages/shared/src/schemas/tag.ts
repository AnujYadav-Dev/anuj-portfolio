// Tag Zod validation schemas.

import { z } from 'zod';
import { slugSchema, paginationSchema } from './common';
import { EntityType } from '../types/enums';

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slugSchema.optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

export const updateTagSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  slug: slugSchema.optional(),
});

export type UpdateTagInput = z.infer<typeof updateTagSchema>;

export const listTagsQuerySchema = paginationSchema.extend({
  entityType: z.nativeEnum(EntityType).optional(),
  search: z.string().optional(),
});

export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;
