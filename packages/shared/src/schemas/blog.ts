import { z } from 'zod';
import {
  slugSchema,
  paginationSchema,
  seoFieldsSchema,
  optionalUuidSchema,
} from './common';

import { ContentStatus } from '../types/enums';

/** Create blog post request validation. */
export const createBlogPostSchema = z
  .object({
    title: z.string().min(1).max(300),
    slug: slugSchema,
    content: z.string().min(1),
    excerpt: z.string().optional(),
    readingTimeMinutes: z.number().int().min(0).optional(),
    status: z.nativeEnum(ContentStatus).default(ContentStatus.Draft),
    isFeatured: z.boolean().default(false),
    categoryId: optionalUuidSchema,
    coverImageId: optionalUuidSchema,
    tagIds: z.array(z.string().uuid()).optional(),
  })
  .merge(seoFieldsSchema);


export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;

/** Update blog post request validation — all fields optional. */
export const updateBlogPostSchema = createBlogPostSchema.partial();

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;

/** List blog posts query parameters. */
export const listBlogPostsQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ContentStatus).optional(),
  categoryId: z.string().uuid().optional(),
  tag: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  authorId: z.string().uuid().optional(),
});

export type ListBlogPostsQuery = z.infer<typeof listBlogPostsQuerySchema>;

/** Create/update blog category schema. */
export const upsertBlogCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
});

export type UpsertBlogCategoryInput = z.infer<typeof upsertBlogCategorySchema>;
