// src/core/interfaces/repositories/base.repository.interface.ts
export interface IBaseRepository<T, K = string> {
  findById(id: K): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: K, updates: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
  exists(id: K): Promise<boolean>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginatedRepository<T, K = string> extends IBaseRepository<T, K> {
  findWithPagination(options: PaginationOptions): Promise<PaginatedResult<T>>;
}