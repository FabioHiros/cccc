// src/presentation/routes/booking.routes.ts
import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { CreateBookingUseCase } from '../../application/use-cases/booking/create-booking.use-case';
import { GetBookingUseCase } from '../../application/use-cases/booking/get-booking.use-case';
import { CheckAvailabilityUseCase } from '../../application/use-cases/booking/check-availability.use-case';
import { BookingRepository } from '../../infrastructure/database/repositories/booking.repository';
import { GuestRepository } from '../../infrastructure/database/repositories/guest.repository';
import { RoomRepository } from '../../infrastructure/database/repositories/room.repository';
import DatabaseConnection from '../../infrastructure/database/connection';

const router = Router();

// Initialize dependencies
const prisma = DatabaseConnection.getInstance();
const bookingRepository = new BookingRepository(prisma);
const guestRepository = new GuestRepository(prisma);
const roomRepository = new RoomRepository(prisma);

// Initialize use cases
const createBookingUseCase = new CreateBookingUseCase(
  bookingRepository,
  guestRepository,
  roomRepository
);
const getBookingUseCase = new GetBookingUseCase(bookingRepository);
const checkAvailabilityUseCase = new CheckAvailabilityUseCase(
  bookingRepository,
  roomRepository
);

// Initialize controller
const bookingController = new BookingController(
  createBookingUseCase,
  getBookingUseCase,
  checkAvailabilityUseCase
);

// Routes
router.get('/', bookingController.getAllBookings.bind(bookingController));
router.get('/active', bookingController.getActiveBookings.bind(bookingController));
router.get('/upcoming', bookingController.getUpcomingBookings.bind(bookingController));
router.get('/past', bookingController.getPastBookings.bind(bookingController));
router.get('/date-range', bookingController.getBookingsByDateRange.bind(bookingController));
router.get('/availability', bookingController.checkAvailability.bind(bookingController));
router.get('/status/:status', bookingController.getBookingsByStatus.bind(bookingController));
router.get('/primary/:primaryId', bookingController.getBookingsByPrimaryGuest.bind(bookingController));
router.get('/room/:roomId', bookingController.getBookingsByRoom.bind(bookingController));
router.get('/room/:roomId/availability', bookingController.checkSpecificRoomAvailability.bind(bookingController));
router.get('/:id', bookingController.getBooking.bind(bookingController));

router.post('/', bookingController.createBooking.bind(bookingController));

router.put('/:id', bookingController.updateBooking.bind(bookingController));

router.delete('/:id', bookingController.deleteBooking.bind(bookingController));

export { router as bookingRoutes };