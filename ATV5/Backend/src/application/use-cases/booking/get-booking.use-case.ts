// src/application/use-cases/booking/get-booking.use-case.ts
import { IBookingRepository } from '../../../core/interfaces/repositories/booking.repository.interface';
import { BookingEntity } from '../../../core/entities/booking.entity';
import { BookingStatus } from '../../../core/enums/booking-status.enum';
import { PaginationOptions, PaginatedResult } from '../../../core/interfaces/repositories/base.repository.interface';
import { UpdateBookingDto } from '../../../core/dtos/booking/update-booking.dto';

export class GetBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(id: string): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(id);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  async getAllBookings(options?: PaginationOptions): Promise<BookingEntity[] | PaginatedResult<BookingEntity>> {
    if (options) {
      return this.bookingRepository.findWithPagination(options);
    }
    
    return this.bookingRepository.findAll();
  }

  async getBookingsByPrimaryGuest(primaryGuestId: string): Promise<BookingEntity[]> {
    return this.bookingRepository.findByPrimaryGuestId(primaryGuestId);
  }

  async getBookingsByRoom(roomId: string): Promise<BookingEntity[]> {
    return this.bookingRepository.findByRoomId(roomId);
  }

  async getBookingsByStatus(status: BookingStatus): Promise<BookingEntity[]> {
    return this.bookingRepository.findByStatus(status);
  }

  async getActiveBookings(): Promise<BookingEntity[]> {
    return this.bookingRepository.findActiveBookings();
  }

  async getUpcomingBookings(): Promise<BookingEntity[]> {
    return this.bookingRepository.findUpcomingBookings();
  }

  async getPastBookings(): Promise<BookingEntity[]> {
    return this.bookingRepository.findPastBookings();
  }

  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<BookingEntity[]> {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    return this.bookingRepository.findByDateRange(startDate, endDate);
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingEntity> {
    // Check if booking exists
    const existingBooking = await this.bookingRepository.findById(id);
    if (!existingBooking) {
      throw new Error('Booking not found');
    }

    // Validate dates if being updated
    if (updateBookingDto.arrivalDate || updateBookingDto.departDate) {
      const arrivalDate = updateBookingDto.arrivalDate 
        ? new Date(updateBookingDto.arrivalDate) 
        : existingBooking.arrivalDate;
      const departDate = updateBookingDto.departDate 
        ? new Date(updateBookingDto.departDate) 
        : existingBooking.departDate;

      if (arrivalDate >= departDate) {
        throw new Error('Arrival date must be before departure date');
      }

      // Check room availability if dates or room are being changed
      if (updateBookingDto.roomId || updateBookingDto.arrivalDate || updateBookingDto.departDate) {
        const roomId = updateBookingDto.roomId || existingBooking.roomId;
        
        const isAvailable = await this.bookingRepository.checkRoomAvailability(
          roomId,
          arrivalDate,
          departDate
        );

        if (!isAvailable) {
          throw new Error('Room is not available for the selected dates');
        }
      }
    }

    // Update booking
    return this.bookingRepository.update(id, {
      roomId: updateBookingDto.roomId,
      arrivalDate: updateBookingDto.arrivalDate ? new Date(updateBookingDto.arrivalDate) : undefined,
      departDate: updateBookingDto.departDate ? new Date(updateBookingDto.departDate) : undefined,
      status: updateBookingDto.status,
      totalAmount: updateBookingDto.totalAmount,
      notes: updateBookingDto.notes,
    });
  }

  async deleteBooking(id: string): Promise<void> {
    // Check if booking exists
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if booking can be cancelled (not already checked out)
    if (booking.status === BookingStatus.CHECKED_OUT) {
      throw new Error('Cannot delete a completed booking');
    }

    await this.bookingRepository.delete(id);
  }
}