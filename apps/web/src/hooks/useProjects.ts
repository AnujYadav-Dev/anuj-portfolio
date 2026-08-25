'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  ListProjectsQuery,
  PaginatedResponse,
  ProjectCategoryDto,
  ProjectDto,
  ProjectListItemDto,
} from '@portfolio/shared';

export function useProjects(query?: ListProjectsQuery) {
  return useQuery<PaginatedResponse<ProjectListItemDto>>({
    queryKey: ['projects', query],
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProjectListItemDto>>('/projects', {
        params: query as Record<string, string | number | boolean | undefined | null>,
      }),
  });
}

export function useProjectBySlug(slug: string, author?: string) {
  const path = author
    ? `/projects/by/${author}/${slug}`
    : `/projects/${slug}`;

  return useQuery<{ data: ProjectDto }>({
    queryKey: ['project', slug, author],
    queryFn: () => apiClient.get<{ data: ProjectDto }>(path),
    enabled: Boolean(slug),
  });
}

export function useProjectCategories() {
  return useQuery<{ data: ProjectCategoryDto[] }>({
    queryKey: ['project-categories'],
    queryFn: () =>
      apiClient.get<{ data: ProjectCategoryDto[] }>('/project-categories'),
  });
}
