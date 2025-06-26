import { Router } from 'express';
import guestController from '../controllers/guest.controller';

const router = Router();

// Retrieve all guests
router.get('/', guestController.retrieveAll);

// Retrieve all primary guests
router.get('/primary', guestController.retrieveAllPrimary);

// Retrieve all companions
router.get('/companions', guestController.retrieveAllCompanions);

// Retrieve guest by ID
router.get('/:id', guestController.retrieveById);

// Retrieve companions by primary guest ID
router.get('/primary/:primaryId/companions', guestController.retrieveCompanionsByPrimary);

// Register a new primary guest
router.post('/primary', guestController.registerPrimary);

// Register a new companion
router.post('/primary/:primaryId/companion', guestController.registerCompanion);

// Modify guest information
router.put('/:id', guestController.modify);

// Modify guest address
router.put('/:id/address', guestController.modifyAddress);

// Attach document to guest
router.post('/:id/document', guestController.attachDocument);

// Attach contact to guest
router.post('/:id/contact', guestController.attachContact);

// Remove guest
router.delete('/:id', guestController.remove);

export default router;