// Common reusable Zod schemas.

import { z } from 'zod';

/** Slug validation pattern: lowercase alphanumeric with hyphens. */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Reusable pagination query parameters. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

/** Reusable slug field schema. */
export const slugSchema = z
  .string()
  .min(1)
  .max(300)
  .regex(SLUG_REGEX, 'Slug must be lowercase alphanumeric with hyphens');

/** Reusable SEO fields schema (all optional). */
export const seoFieldsSchema = z.object({
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.string().max(500).optional(),
  ogImageId: z.string().uuid().optional(),
});

/** UUID param schema. */
export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});
