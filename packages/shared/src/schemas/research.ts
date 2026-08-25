import { z } from 'zod';
import {
  slugSchema,
  paginationSchema,
  seoFieldsSchema,
  optionalDateStringSchema,
  optionalUuidSchema,
  optionalUrlSchema,
} from './common';

import { ContentStatus } from '../types/enums';

/** Create research paper request validation. */
export const createResearchPaperSchema = z
  .object({
    title: z.string().min(1).max(300),
    slug: slugSchema,
    abstract: z.string().optional(),
    content: z.string().optional(),
    doi: z.string().max(200).optional(),
    publicationUrl: optionalUrlSchema,
    publicationName: z.string().max(200).optional(),
    publicationDate: optionalDateStringSchema,
    status: z.nativeEnum(ContentStatus).default(ContentStatus.Draft),
    isFeatured: z.boolean().default(false),
    pdfId: optionalUuidSchema,
    tagIds: z.array(z.string().uuid()).optional(),
  })
  .merge(seoFieldsSchema);

export type CreateResearchPaperInput = z.infer<typeof createResearchPaperSchema>;

/** Update research paper request validation — all fields optional. */
export const updateResearchPaperSchema = createResearchPaperSchema.partial();

export type UpdateResearchPaperInput = z.infer<typeof updateResearchPaperSchema>;

/** List research papers query parameters. */
export const listResearchPapersQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ContentStatus).optional(),
  tag: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  authorId: z.string().uuid().optional(),
});

export type ListResearchPapersQuery = z.infer<typeof listResearchPapersQuerySchema>;
