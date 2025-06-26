// src/presentation/routes/room.routes.ts
import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { CreateRoomUseCase } from '../../application/use-cases/room/create-room.use-case';
import { GetRoomUseCase } from '../../application/use-cases/room/get-room.use-case';
import { GetAvailableRoomsUseCase } from '../../application/use-cases/room/get-available-rooms.use-case';
import { RoomRepository } from '../../infrastructure/database/repositories/room.repository';
import DatabaseConnection from '../../infrastructure/database/connection';

const router = Router();

// Initialize dependencies
const prisma = DatabaseConnection.getInstance();
const roomRepository = new RoomRepository(prisma);

// Initialize use cases
const createRoomUseCase = new CreateRoomUseCase(roomRepository);
const getRoomUseCase = new GetRoomUseCase(roomRepository);
const getAvailableRoomsUseCase = new GetAvailableRoomsUseCase(roomRepository);

// Initialize controller
const roomController = new RoomController(
  createRoomUseCase,
  getRoomUseCase,
  getAvailableRoomsUseCase
);

// Routes
router.get('/', roomController.getAllRooms.bind(roomController));
router.get('/active', roomController.getActiveRooms.bind(roomController));
router.get('/inactive', roomController.getInactiveRooms.bind(roomController));
router.get('/available', roomController.getAvailableRooms.bind(roomController));
router.get('/:id', roomController.getRoom.bind(roomController));

router.post('/', roomController.createRoom.bind(roomController));
router.post('/standard', roomController.createStandardRooms.bind(roomController));

router.put('/:id', roomController.updateRoom.bind(roomController));

router.delete('/:id', roomController.deleteRoom.bind(roomController));

export { router as roomRoutes };