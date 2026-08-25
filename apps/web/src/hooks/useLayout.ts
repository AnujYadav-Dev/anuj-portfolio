'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { HomepageSectionDto, NavItemDto, PageDto } from '@portfolio/shared';

export function useHomepageSections() {
  return useQuery<{ data: HomepageSectionDto[] }>({
    queryKey: ['homepage-sections'],
    queryFn: () => apiClient.get<{ data: HomepageSectionDto[] }>('/homepage-sections'),
  });
}

export function useNavItems(location?: 'header' | 'footer' | 'both') {
  return useQuery<{ data: NavItemDto[] }>({
    queryKey: ['nav-items', location],
    queryFn: () =>
      apiClient.get<{ data: NavItemDto[] }>('/nav-items', {
        params: location ? { location } : undefined,
      }),
  });
}

export function useSiteSettings() {
  return useQuery<{ data: Record<string, string> }>({
    queryKey: ['site-settings'],
    queryFn: () => apiClient.get<{ data: Record<string, string> }>('/site-settings'),
  });
}

export function useDynamicPage(slug: string) {
  return useQuery<{ data: PageDto }>({
    queryKey: ['page', slug],
    queryFn: () => apiClient.get<{ data: PageDto }>(`/pages/${slug}`),
    enabled: Boolean(slug),
  });
}
