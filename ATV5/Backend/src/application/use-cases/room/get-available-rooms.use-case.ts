// src/application/use-cases/room/get-available-rooms.use-case.ts
import { IRoomRepository } from '../../../core/interfaces/repositories/room.repository.interface';
import { RoomEntity } from '../../../core/entities/room.entity';

export class GetAvailableRoomsUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(checkIn: Date, checkOut: Date): Promise<RoomEntity[]> {
    // Validate dates
    if (checkIn >= checkOut) {
      throw new Error('Check-in date must be before check-out date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past');
    }

    // Get available rooms for the specified date range
    return this.roomRepository.findAvailableRooms(checkIn, checkOut);
  }
}