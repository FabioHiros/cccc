import { Router } from 'express';
import roomRoutes from './room.routes';
import bookingRoutes from './booking.routes';
import guestRoutes from './guest.routes';

const router = Router();

router.use('/rooms', roomRoutes);
router.use('/guests', guestRoutes);
router.use('/bookings', bookingRoutes);

export default router;