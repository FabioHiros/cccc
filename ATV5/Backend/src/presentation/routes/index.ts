// src/presentation/routes/index.ts
import { Router } from 'express';
import { guestRoutes } from './guest.routes';
import { roomRoutes } from './room.routes';
import { bookingRoutes } from './booking.routes';
import { HealthController } from '../controllers/health.controller';

const router = Router();
const healthController = new HealthController();

// Health check routes
router.get('/health', healthController.checkHealth.bind(healthController));
router.get('/health/ready', healthController.checkReadiness.bind(healthController));
router.get('/health/live', healthController.checkLiveness.bind(healthController));

// API version prefix
const API_VERSION = '/v1';

// Main API routes
router.use(`${API_VERSION}/guests`, guestRoutes);
router.use(`${API_VERSION}/rooms`, roomRoutes);
router.use(`${API_VERSION}/bookings`, bookingRoutes);

import { DebugController } from '../controllers/debug.controller';

// Add this after your existing controller initialization
const debugController = new DebugController();

// Add these routes BEFORE your existing routes
router.get('/debug/database', debugController.checkDatabase.bind(debugController));
router.delete('/debug/clear', debugController.clearDatabase.bind(debugController));

export { router as routes };