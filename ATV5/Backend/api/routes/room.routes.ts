import { Router } from 'express';
import roomController from '../controllers/room.controller';

const router = Router();

// Retrieve and generate rooms
router
    .route('/')
    .post(roomController.generateCustom)
    .get(roomController.retrieveAll);

// Specific room operations
router
    .route('/:id')
    .get(roomController.retrieveById)
    .put(roomController.modify)
    .delete(roomController.remove);

// Generate standard room configurations
router.post('/standard', roomController.generateStandard);

export default router;