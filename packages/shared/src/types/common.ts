// Common types used across multiple domains.

/** Standard paginated API response wrapper. */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** Pagination metadata returned with list endpoints. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Standard API error response. */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/** Sort order direction. */
export type SortOrder = 'asc' | 'desc';

/** Reusable SEO fields present on content entities. */
export interface SeoFields {
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
}
