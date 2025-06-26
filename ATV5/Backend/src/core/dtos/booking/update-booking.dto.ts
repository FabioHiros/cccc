// src/core/dtos/booking/update-booking.dto.ts
import { BookingStatus } from '../../enums/booking-status.enum';

export interface UpdateBookingDto {
  roomId?: string;
  arrivalDate?: string; // ISO date string
  departDate?: string; // ISO date string
  status?: BookingStatus;
  totalAmount?: number;
  notes?: string;
}