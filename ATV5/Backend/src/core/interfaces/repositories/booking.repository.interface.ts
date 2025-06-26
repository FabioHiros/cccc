// src/core/interfaces/repositories/booking.repository.interface.ts
import { BookingEntity } from '../../entities/booking.entity';
import { BookingStatus } from '../../enums/booking-status.enum';
import { IPaginatedRepository } from './base.repository.interface';

export interface IBookingRepository extends IPaginatedRepository<BookingEntity> {
  findByPrimaryGuestId(primaryGuestId: string): Promise<BookingEntity[]>;
  findByRoomId(roomId: string): Promise<BookingEntity[]>;
  findByStatus(status: BookingStatus): Promise<BookingEntity[]>;
  findActiveBookings(): Promise<BookingEntity[]>;
  findUpcomingBookings(): Promise<BookingEntity[]>;
  findPastBookings(): Promise<BookingEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<BookingEntity[]>;
  checkRoomAvailability(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
}