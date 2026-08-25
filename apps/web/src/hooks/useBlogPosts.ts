'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  BlogCategoryDto,
  BlogPostDto,
  BlogPostListItemDto,
  ListBlogPostsQuery,
  PaginatedResponse,
} from '@portfolio/shared';

export function useBlogPosts(query?: Partial<ListBlogPostsQuery>) {
  return useQuery<PaginatedResponse<BlogPostListItemDto>>({
    queryKey: ['blogs', query],
    queryFn: () =>
      apiClient.get<PaginatedResponse<BlogPostListItemDto>>('/blogs', {
        params: query as Record<string, string | number | boolean | undefined | null>,
      }),
  });
}

export function useBlogPostBySlug(slug: string, author?: string) {
  const path = author ? `/blogs/by/${author}/${slug}` : `/blogs/${slug}`;

  return useQuery<{ data: BlogPostDto }>({
    queryKey: ['blog', slug, author],
    queryFn: () => apiClient.get<{ data: BlogPostDto }>(path),
    enabled: Boolean(slug),
  });
}

export function useBlogCategories() {
  return useQuery<{ data: BlogCategoryDto[] }>({
    queryKey: ['blog-categories'],
    queryFn: () => apiClient.get<{ data: BlogCategoryDto[] }>('/blog-categories'),
  });
}
