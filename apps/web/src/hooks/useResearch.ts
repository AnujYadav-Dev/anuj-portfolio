'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  ListResearchPapersQuery,
  PaginatedResponse,
  ResearchPaperDto,
  ResearchPaperListItemDto,
} from '@portfolio/shared';

export function useResearchPapers(query?: ListResearchPapersQuery) {
  return useQuery<PaginatedResponse<ResearchPaperListItemDto>>({
    queryKey: ['research', query],
    queryFn: () =>
      apiClient.get<PaginatedResponse<ResearchPaperListItemDto>>('/research', {
        params: query as Record<string, string | number | boolean | undefined | null>,
      }),
  });
}

export function useResearchPaperBySlug(slug: string, author?: string) {
  const path = author
    ? `/research/by/${author}/${slug}`
    : `/research/${slug}`;

  return useQuery<{ data: ResearchPaperDto }>({
    queryKey: ['research-paper', slug, author],
    queryFn: () => apiClient.get<{ data: ResearchPaperDto }>(path),
    enabled: Boolean(slug),
  });
}
