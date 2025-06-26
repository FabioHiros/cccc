// src/core/entities/booking.entity.ts
import { BaseEntity } from './base.entity';
import { BookingStatus } from '../enums/booking-status.enum';
import { GuestEntity } from './guest.entity';
import { RoomEntity } from './room.entity';

export class BookingEntity extends BaseEntity {
  public primaryId: string;
  public roomId: string;
  public arrivalDate: Date;
  public departDate: Date;
  public status: BookingStatus;
  public totalAmount?: number;
  public notes?: string;

  // Relations
  public primary?: GuestEntity;
  public room?: RoomEntity;

  constructor(
    id: string,
    primaryId: string,
    roomId: string,
    arrivalDate: Date,
    departDate: Date,
    status: BookingStatus = BookingStatus.CONFIRMED,
    totalAmount?: number,
    notes?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.primaryId = primaryId;
    this.roomId = roomId;
    this.arrivalDate = arrivalDate;
    this.departDate = departDate;
    this.status = status;
    this.totalAmount = totalAmount;
    this.notes = notes;
  }

  public getDurationInDays(): number {
    const diffTime = Math.abs(this.departDate.getTime() - this.arrivalDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public isActive(): boolean {
    const now = new Date();
    return this.arrivalDate <= now && this.departDate >= now && this.status === BookingStatus.CHECKED_IN;
  }

  public isPending(): boolean {
    return this.status === BookingStatus.PENDING;
  }

  public isConfirmed(): boolean {
    return this.status === BookingStatus.CONFIRMED;
  }

  public checkIn(): void {
    this.status = BookingStatus.CHECKED_IN;
    this.updateTimestamp();
  }

  public checkOut(): void {
    this.status = BookingStatus.CHECKED_OUT;
    this.updateTimestamp();
  }

  public cancel(): void {
    this.status = BookingStatus.CANCELLED;
    this.updateTimestamp();
  }

  public markAsNoShow(): void {
    this.status = BookingStatus.NO_SHOW;
    this.updateTimestamp();
  }
}