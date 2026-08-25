'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  PublicStatsDto,
  SearchQuery,
  SearchResultsDto,
  TagWithCountDto,
} from '@portfolio/shared';

export function useSearch(query: SearchQuery) {
  return useQuery<{ data: SearchResultsDto }>({
    queryKey: ['search', query],
    queryFn: () =>
      apiClient.get<{ data: SearchResultsDto }>('/search', {
        params: {
          q: query.q,
          type: query.type,
          limit: query.limit,
        },
      }),
    enabled: Boolean(query.q && query.q.trim().length > 0),
  });
}

export function usePublicStats() {
  return useQuery<{ data: PublicStatsDto }>({
    queryKey: ['stats'],
    queryFn: () => apiClient.get<{ data: PublicStatsDto }>('/stats'),
  });
}

export function useTags() {
  return useQuery<{ data: TagWithCountDto[] }>({
    queryKey: ['tags'],
    queryFn: () => apiClient.get<{ data: TagWithCountDto[] }>('/tags'),
  });
}
