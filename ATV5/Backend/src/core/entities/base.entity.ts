// src/core/entities/base.entity.ts
export abstract class BaseEntity {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}