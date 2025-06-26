// src/core/dtos/booking/create-booking.dto.ts
import { BookingStatus } from '../../enums/booking-status.enum';

export interface CreateBookingDto {
  primaryId: string;
  roomId: string;
  arrivalDate: string; // ISO date string
  departDate: string; // ISO date string
  status?: BookingStatus;
  totalAmount?: number;
  notes?: string;
}