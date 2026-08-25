import type { PaginationMeta } from '@portfolio/shared';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PrismaPaginationQuery {
  skip: number;
  take: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/** Compute skip and take for Prisma queries. */
export function getPrismaPagination(
  params: PaginationParams,
  defaultSortBy = 'createdAt',
): PrismaPaginationQuery {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const sortBy = params.sortBy ?? defaultSortBy;
  const sortOrder = params.sortOrder ?? 'desc';

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { [sortBy]: sortOrder },
  };
}

/** Build standard pagination metadata response. */
export function buildPagination(
  page: number,
  pageSize: number,
  totalItems: number,
): PaginationMeta {
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, pageSize);
  const totalPages = Math.ceil(totalItems / validPageSize);

  return {
    page: validPage,
    pageSize: validPageSize,
    totalItems,
    totalPages,
  };
}
