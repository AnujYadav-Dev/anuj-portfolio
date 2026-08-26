// Search Zod validation schemas.

import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().trim().max(100).default(''),
  type: z
    .enum(['all', 'project', 'blog_post', 'research_paper', 'skill', 'page', 'about_section'])
    .default('all'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

