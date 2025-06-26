// src/infrastructure/database/repositories/base.repository.ts
import { PrismaClient } from '@prisma/client';
import { IBaseRepository, PaginationOptions, PaginatedResult } from '../../../core/interfaces/repositories/base.repository.interface';

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  abstract update(id: string, updates: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;

  async exists(id: string): Promise<boolean> {
    const model = this.getModel();
    const result = await model.findUnique({
      where: { id },
      select: { id: true }
    });
    return result !== null;
  }

  protected getModel(): any {
    return (this.prisma as any)[this.modelName];
  }

  protected async findWithPaginationBase(
    options: PaginationOptions,
    whereClause: any = {},
    includeClause: any = {}
  ): Promise<PaginatedResult<any>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const model = this.getModel();

    const [data, total] = await Promise.all([
      model.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      model.count({ where: whereClause })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}