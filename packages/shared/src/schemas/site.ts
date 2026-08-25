import { z } from 'zod';
import {
  slugSchema,
  paginationSchema,
  seoFieldsSchema,
  optionalUuidSchema,
} from './common';

import { ContentStatus, BlockType, NavLocation } from '../types/enums';

/** Update site setting. */
export const updateSiteSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1),
  group: z.string().max(50).optional(),
});

export type UpdateSiteSettingInput = z.infer<typeof updateSiteSettingSchema>;

/** Create/update homepage section. */
export const upsertHomepageSectionSchema = z.object({
  sectionKey: z.string().min(1).max(50),
  title: z.string().max(200).optional(),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
  config: z.record(z.unknown()).default({}),
});

export type UpsertHomepageSectionInput = z.infer<typeof upsertHomepageSectionSchema>;

/** Create/update content block. */
export const upsertContentBlockSchema = z.object({
  blockType: z.nativeEnum(BlockType),
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  mediaId: optionalUuidSchema,
  config: z.record(z.unknown()).default({}),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
  pageId: optionalUuidSchema,
  homepageSectionId: optionalUuidSchema,
});

export type UpsertContentBlockInput = z.infer<typeof upsertContentBlockSchema>;

/** Create/update nav item. */
export const upsertNavItemSchema = z.object({
  label: z.string().min(1).max(100),
  url: z.string().min(1).max(500),
  location: z.nativeEnum(NavLocation).default(NavLocation.Header),
  isExternal: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
  parentId: optionalUuidSchema,
});

export type UpsertNavItemInput = z.infer<typeof upsertNavItemSchema>;


/** Create page request validation. */
export const createPageSchema = z
  .object({
    title: z.string().min(1).max(300),
    slug: slugSchema,
    content: z.string().optional(),
    status: z.nativeEnum(ContentStatus).default(ContentStatus.Draft),
    isNavVisible: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  })
  .merge(seoFieldsSchema);

export type CreatePageInput = z.infer<typeof createPageSchema>;

/** Update page request validation — all fields optional. */
export const updatePageSchema = createPageSchema.partial();

export type UpdatePageInput = z.infer<typeof updatePageSchema>;

/** List pages query parameters. */
export const listPagesQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ContentStatus).optional(),
});

export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>;

/** Update email template schema. */
export const updateEmailTemplateSchema = z.object({
  subject: z.string().min(1).max(300).optional(),
  bodyHtml: z.string().min(1).optional(),
  bodyText: z.string().nullable().optional(),
});

export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;
