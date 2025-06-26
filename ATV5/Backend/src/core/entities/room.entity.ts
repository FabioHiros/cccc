// src/core/entities/room.entity.ts
import { BaseEntity } from './base.entity';

export class RoomEntity extends BaseEntity {
  public designation: string;
  public singleBeds: number;
  public doubleBeds: number;
  public bathrooms: number;
  public hasAirControl: boolean;
  public parkingSpaces: number;
  public isActive: boolean;

  constructor(
    id: string,
    designation: string,
    singleBeds: number,
    doubleBeds: number,
    bathrooms: number,
    hasAirControl: boolean,
    parkingSpaces: number,
    isActive: boolean = true,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.designation = designation;
    this.singleBeds = singleBeds;
    this.doubleBeds = doubleBeds;
    this.bathrooms = bathrooms;
    this.hasAirControl = hasAirControl;
    this.parkingSpaces = parkingSpaces;
    this.isActive = isActive;
  }

  public getTotalBeds(): number {
    return this.singleBeds + this.doubleBeds;
  }

  public getMaxCapacity(): number {
    return this.singleBeds + (this.doubleBeds * 2);
  }

  public deactivate(): void {
    this.isActive = false;
    this.updateTimestamp();
  }

  public activate(): void {
    this.isActive = true;
    this.updateTimestamp();
  }
}