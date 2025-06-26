// src/presentation/controllers/booking.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CreateBookingUseCase } from '../../application/use-cases/booking/create-booking.use-case';
import { GetBookingUseCase } from '../../application/use-cases/booking/get-booking.use-case';
import { CheckAvailabilityUseCase } from '../../application/use-cases/booking/check-availability.use-case';
import { CreateBookingDto } from '../../core/dtos/booking/create-booking.dto';
import { UpdateBookingDto } from '../../core/dtos/booking/update-booking.dto';
import { BookingStatus } from '../../core/enums/booking-status.enum';
import { PaginationOptions } from '../../core/interfaces/repositories/base.repository.interface';

export class BookingController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly getBookingUseCase: GetBookingUseCase,
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase
  ) {}

  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createBookingDto: CreateBookingDto = req.body;
      const booking = await this.createBookingUseCase.execute(createBookingDto);
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  async getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await this.getBookingUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        message: 'Booking retrieved successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const options: PaginationOptions = {
        page,
        limit,
        search,
        sortBy,
        sortOrder
      };

      const result = await this.getBookingUseCase.getAllBookings(options);
      
      if ('data' in result) {
        // Paginated result
        res.status(200).json({
          success: true,
          message: 'Bookings retrieved successfully',
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          }
        });
      } else {
        // All bookings
        res.status(200).json({
          success: true,
          message: 'Bookings retrieved successfully',
          data: result,
          count: result.length
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getBookingsByPrimaryGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { primaryId } = req.params;
      const bookings = await this.getBookingUseCase.getBookingsByPrimaryGuest(primaryId);
      
      res.status(200).json({
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingsByRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const bookings = await this.getBookingUseCase.getBookingsByRoom(roomId);
      
      res.status(200).json({
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingsByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.params;
      const bookingStatus = status.toUpperCase() as BookingStatus;
      
      if (!Object.values(BookingStatus).includes(bookingStatus)) {
        res.status(400).json({
          success: false,
          message: 'Invalid booking status'
        });
        return;
      }

      const bookings = await this.getBookingUseCase.getBookingsByStatus(bookingStatus);
      
      res.status(200).json({
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await this.getBookingUseCase.getActiveBookings();
      
      res.status(200).json({
        success: true,
        message: 'Active bookings retrieved successfully',
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await this.getBookingUseCase.getUpcomingBookings();
      
      res.status(200).json({
        success: true,
        message: 'Upcoming bookings retrieved successfully',
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getPastBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await this.getBookingUseCase.getPastBookings();
      
      res.status(200).json({
        success: true,
        message: 'Past bookings retrieved successfully',
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingsByDateRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const bookings = await this.getBookingUseCase.getBookingsByDateRange(start, end);
      
      res.status(200).json({
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookings,
        count: bookings.length,
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { checkIn, checkOut } = req.query;
      
      if (!checkIn || !checkOut) {
        res.status(400).json({
          success: false,
          message: 'Check-in and check-out dates are required'
        });
        return;
      }

      const checkInDate = new Date(checkIn as string);
      const checkOutDate = new Date(checkOut as string);

      const availability = await this.checkAvailabilityUseCase.execute(checkInDate, checkOutDate);
      
      res.status(200).json({
        success: true,
        message: 'Availability checked successfully',
        data: availability
      });
    } catch (error) {
      next(error);
    }
  }

  async checkSpecificRoomAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const { checkIn, checkOut } = req.query;
      
      if (!checkIn || !checkOut) {
        res.status(400).json({
          success: false,
          message: 'Check-in and check-out dates are required'
        });
        return;
      }

      const checkInDate = new Date(checkIn as string);
      const checkOutDate = new Date(checkOut as string);

      const isAvailable = await this.checkAvailabilityUseCase.checkSpecificRoom(
        roomId,
        checkInDate,
        checkOutDate
      );
      
      res.status(200).json({
        success: true,
        message: 'Room availability checked successfully',
        data: {
          roomId,
          isAvailable,
          dateRange: {
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString()
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateBookingDto: UpdateBookingDto = req.body;
      const booking = await this.getBookingUseCase.updateBooking(id, updateBookingDto);
      
      res.status(200).json({
        success: true,
        message: 'Booking updated successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.getBookingUseCase.deleteBooking(id);
      
      res.status(200).json({
        success: true,
        message: 'Booking deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}