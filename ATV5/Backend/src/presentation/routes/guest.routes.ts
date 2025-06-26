// src/presentation/routes/guest.routes.ts - INJECT BOOKING REPOSITORY
import { Router } from 'express';
import { GuestController } from '../controllers/guest.controller';
import { CreateGuestUseCase } from '../../application/use-cases/guest/create-guest.use-case';
import { GetGuestUseCase } from '../../application/use-cases/guest/get-guest.use-case';
import { UpdateGuestUseCase } from '../../application/use-cases/guest/update-guest.use-case';
import { DeleteGuestUseCase } from '../../application/use-cases/guest/delete-guest.use-case';
import { GetGuestsUseCase } from '../../application/use-cases/guest/get-guests.use-case';
import { GuestRepository } from '../../infrastructure/database/repositories/guest.repository';
import { BookingRepository } from '../../infrastructure/database/repositories/booking.repository'; // ADD THIS
import DatabaseConnection from '../../infrastructure/database/connection';

const router = Router();

// Initialize dependencies
const prisma = DatabaseConnection.getInstance();
const guestRepository = new GuestRepository(prisma);
const bookingRepository = new BookingRepository(prisma); // ADD THIS

// Initialize use cases
const createGuestUseCase = new CreateGuestUseCase(guestRepository);
const getGuestUseCase = new GetGuestUseCase(guestRepository);
const updateGuestUseCase = new UpdateGuestUseCase(guestRepository);
const deleteGuestUseCase = new DeleteGuestUseCase(guestRepository, bookingRepository); // INJECT BOOKING REPO
const getGuestsUseCase = new GetGuestsUseCase(guestRepository);

// Initialize controller
const guestController = new GuestController(
  createGuestUseCase,
  getGuestUseCase,
  updateGuestUseCase,
  deleteGuestUseCase,
  getGuestsUseCase
);

// Routes
router.get('/', guestController.getAllGuests.bind(guestController));
router.get('/primary', guestController.getPrimaryGuests.bind(guestController));
router.get('/companions', guestController.getAllCompanions.bind(guestController));
router.get('/:id', guestController.getGuest.bind(guestController));
router.get('/primary/:primaryId/companions', guestController.getCompanionsByPrimaryId.bind(guestController));

router.post('/', guestController.createGuest.bind(guestController));

router.put('/:id', guestController.updateGuest.bind(guestController));

router.delete('/:id', guestController.deleteGuest.bind(guestController));

export { router as guestRoutes };