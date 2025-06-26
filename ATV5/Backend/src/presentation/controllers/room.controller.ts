// src/presentation/controllers/room.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CreateRoomUseCase } from '../../application/use-cases/room/create-room.use-case';
import { GetRoomUseCase } from '../../application/use-cases/room/get-room.use-case';
import { GetAvailableRoomsUseCase } from '../../application/use-cases/room/get-available-rooms.use-case';
import { CreateRoomDto } from '../../core/dtos/room/create-room.dto';
import { UpdateRoomDto } from '../../core/dtos/room/update-room.dto';
import { PaginationOptions } from '../../core/interfaces/repositories/base.repository.interface';

export class RoomController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly getRoomUseCase: GetRoomUseCase,
    private readonly getAvailableRoomsUseCase: GetAvailableRoomsUseCase
  ) {}

  async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createRoomDto: CreateRoomDto = req.body;
      const room = await this.createRoomUseCase.execute(createRoomDto);
      
      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      });
    } catch (error) {
      next(error);
    }
  }

  async createStandardRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rooms = await this.createRoomUseCase.createStandardRooms();
      
      res.status(201).json({
        success: true,
        message: 'Standard rooms created successfully',
        data: rooms,
        count: rooms.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const room = await this.getRoomUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        message: 'Room retrieved successfully',
        data: room
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const result = await this.getRoomUseCase.getAllRooms(options);
      
      if ('data' in result) {
        // Paginated result
        res.status(200).json({
          success: true,
          message: 'Rooms retrieved successfully',
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          }
        });
      } else {
        // All rooms
        res.status(200).json({
          success: true,
          message: 'Rooms retrieved successfully',
          data: result,
          count: result.length
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getActiveRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rooms = await this.getRoomUseCase.getActiveRooms();
      
      res.status(200).json({
        success: true,
        message: 'Active rooms retrieved successfully',
        data: rooms,
        count: rooms.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getInactiveRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rooms = await this.getRoomUseCase.getInactiveRooms();
      
      res.status(200).json({
        success: true,
        message: 'Inactive rooms retrieved successfully',
        data: rooms,
        count: rooms.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const rooms = await this.getAvailableRoomsUseCase.execute(checkInDate, checkOutDate);
      
      res.status(200).json({
        success: true,
        message: 'Available rooms retrieved successfully',
        data: rooms,
        count: rooms.length,
        dateRange: {
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateRoomDto: UpdateRoomDto = req.body;
      const room = await this.getRoomUseCase.updateRoom(id, updateRoomDto);
      
      res.status(200).json({
        success: true,
        message: 'Room updated successfully',
        data: room
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.getRoomUseCase.deleteRoom(id);
      
      res.status(200).json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}