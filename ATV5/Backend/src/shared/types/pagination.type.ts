// src/shared/types/pagination.type.ts

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Pagination metadata included in responses
 */
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated result structure used internally
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Default pagination configuration
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  sortOrder: 'desc' as SortOrder,
  sortBy: 'createdAt',
} as const;

/**
 * Maximum pagination limits
 */
export const PAGINATION_LIMITS = {
  maxLimit: 100,
  defaultLimit: 10,
} as const;

/**
 * Utility function to create pagination info
 */
export function createPaginationInfo(
  total: number,
  page: number,
  limit: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Utility function to validate and normalize pagination parameters
 */
export function normalizePaginationParams(params: PaginationParams): Required<PaginationParams> {
  const page = Math.max(1, params.page || DEFAULT_PAGINATION.page);
  const limit = Math.min(
    PAGINATION_LIMITS.maxLimit,
    Math.max(1, params.limit || DEFAULT_PAGINATION.limit)
  );
  
  return {
    page,
    limit,
    sortBy: params.sortBy || DEFAULT_PAGINATION.sortBy,
    sortOrder: params.sortOrder || DEFAULT_PAGINATION.sortOrder,
    search: params.search || '',
  };
}

/**
 * Calculate offset for database queries
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}