// src/core/interfaces/repositories/room.repository.interface.ts
import { RoomEntity } from '../../entities/room.entity';
import { IPaginatedRepository } from './base.repository.interface';

export interface IRoomRepository extends IPaginatedRepository<RoomEntity> {
  findAvailableRooms(checkIn: Date, checkOut: Date): Promise<RoomEntity[]>;
  findByDesignation(designation: string): Promise<RoomEntity | null>;
  findActiveRooms(): Promise<RoomEntity[]>;
  findInactiveRooms(): Promise<RoomEntity[]>;
  createStandardRooms(): Promise<RoomEntity[]>;
}