// src/application/use-cases/room/get-room.use-case.ts
import { IRoomRepository } from '../../../core/interfaces/repositories/room.repository.interface';
import { RoomEntity } from '../../../core/entities/room.entity';
import { PaginationOptions, PaginatedResult } from '../../../core/interfaces/repositories/base.repository.interface';

export class GetRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(id: string): Promise<RoomEntity> {
    const room = await this.roomRepository.findById(id);
    
    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  async getAllRooms(options?: PaginationOptions): Promise<RoomEntity[] | PaginatedResult<RoomEntity>> {
    if (options) {
      return this.roomRepository.findWithPagination(options);
    }
    
    return this.roomRepository.findAll();
  }

  async getActiveRooms(): Promise<RoomEntity[]> {
    return this.roomRepository.findActiveRooms();
  }

  async getInactiveRooms(): Promise<RoomEntity[]> {
    return this.roomRepository.findInactiveRooms();
  }

  async updateRoom(id: string, updates: Partial<RoomEntity>): Promise<RoomEntity> {
    // Check if room exists
    const existingRoom = await this.roomRepository.findById(id);
    if (!existingRoom) {
      throw new Error('Room not found');
    }

    // Check if designation is being changed and if it already exists
    if (updates.designation && updates.designation !== existingRoom.designation) {
      const roomWithDesignation = await this.roomRepository.findByDesignation(updates.designation);
      if (roomWithDesignation) {
        throw new Error(`Room with designation '${updates.designation}' already exists`);
      }
    }

    // Validate room has at least one bed if beds are being updated
    if ((updates.singleBeds !== undefined || updates.doubleBeds !== undefined)) {
      const singleBeds = updates.singleBeds !== undefined ? updates.singleBeds : existingRoom.singleBeds;
      const doubleBeds = updates.doubleBeds !== undefined ? updates.doubleBeds : existingRoom.doubleBeds;
      
      if (singleBeds === 0 && doubleBeds === 0) {
        throw new Error('Room must have at least one bed');
      }
    }

    return this.roomRepository.update(id, updates);
  }

  async deleteRoom(id: string): Promise<void> {
    // Check if room exists
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new Error('Room not found');
    }

    // TODO: Check if room has active bookings before deletion
    // This would require injecting the booking repository

    await this.roomRepository.delete(id);
  }
}