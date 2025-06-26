// src/application/use-cases/booking/check-availability.use-case.ts
import { IBookingRepository } from '../../../core/interfaces/repositories/booking.repository.interface';
import { IRoomRepository } from '../../../core/interfaces/repositories/room.repository.interface';
import { RoomEntity } from '../../../core/entities/room.entity';

export interface AvailabilityResult {
  isAvailable: boolean;
  availableRooms: RoomEntity[];
  totalRooms: number;
  unavailableRooms: string[];
}

export class CheckAvailabilityUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly roomRepository: IRoomRepository
  ) {}

  async execute(checkIn: Date, checkOut: Date): Promise<AvailabilityResult> {
    // Validate dates
    if (checkIn >= checkOut) {
      throw new Error('Check-in date must be before check-out date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past');
    }

    // Get all active rooms
    const allRooms = await this.roomRepository.findActiveRooms();
    const availableRooms: RoomEntity[] = [];
    const unavailableRooms: string[] = [];

    // Check availability for each room
    for (const room of allRooms) {
      const isAvailable = await this.bookingRepository.checkRoomAvailability(
        room.id,
        checkIn,
        checkOut
      );

      if (isAvailable) {
        availableRooms.push(room);
      } else {
        unavailableRooms.push(room.designation);
      }
    }

    return {
      isAvailable: availableRooms.length > 0,
      availableRooms,
      totalRooms: allRooms.length,
      unavailableRooms
    };
  }

  async checkSpecificRoom(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    // Validate dates
    if (checkIn >= checkOut) {
      throw new Error('Check-in date must be before check-out date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past');
    }

    // Check if room exists and is active
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (!room.isActive) {
      return false;
    }

    // Check room availability
    return this.bookingRepository.checkRoomAvailability(roomId, checkIn, checkOut);
  }
}