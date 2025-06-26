import { Router } from 'express';
import bookingController from '../controllers/booking.controller';

const router = Router();

// Retrieve all bookings
router.get('/', bookingController.retrieveAll);

// Retrieve booking by ID
router.get('/:id', bookingController.retrieveById);

// Retrieve bookings by primary guest ID
router.get('/primary/:primaryId', bookingController.retrieveByPrimaryId);

// Create a new booking
router.post('/', bookingController.create);

// Modify booking
router.put('/:id', bookingController.modify);

// Remove booking
router.delete('/:id', bookingController.remove);

export default router;