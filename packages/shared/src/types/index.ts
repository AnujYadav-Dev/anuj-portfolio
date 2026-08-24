// Shared type definitions
// Add DTOs, interfaces, and enums here as features are built.

/** Content lifecycle status — mirrors the `content_status` PostgreSQL enum. */
export enum ContentStatus {
  Draft = 'draft',
  Published = 'published',
  Scheduled = 'scheduled',
  Archived = 'archived',
  Disabled = 'disabled',
}

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
