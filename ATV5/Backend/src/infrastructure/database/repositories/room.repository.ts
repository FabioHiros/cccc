// src/infrastructure/database/repositories/room.repository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { RoomEntity } from '../../../core/entities/room.entity';
import { IRoomRepository } from '../../../core/interfaces/repositories/room.repository.interface';
import { BaseRepository } from './base.repository';
import { PaginationOptions, PaginatedResult } from '../../../core/interfaces/repositories/base.repository.interface';

export class RoomRepository extends BaseRepository<RoomEntity> implements IRoomRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'roomUnit');
  }

  async findById(id: string): Promise<RoomEntity | null> {
    const room = await this.prisma.roomUnit.findUnique({
      where: { id }
    });

    return room ? this.mapToEntity(room) : null;
  }

  async findAll(): Promise<RoomEntity[]> {
    const rooms = await this.prisma.roomUnit.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return rooms.map(this.mapToEntity);
  }

  async create(entity: Omit<RoomEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoomEntity> {
    const room = await this.prisma.roomUnit.create({
      data: {
        designation: entity.designation,
        singleBeds: entity.singleBeds,
        doubleBeds: entity.doubleBeds,
        bathrooms: entity.bathrooms,
        hasAirControl: entity.hasAirControl,
        parkingSpaces: entity.parkingSpaces,
        isActive: entity.isActive !== undefined ? entity.isActive : true,
      }
    });

    return this.mapToEntity(room);
  }

  async update(id: string, updates: Partial<RoomEntity>): Promise<RoomEntity> {
    const room = await this.prisma.roomUnit.update({
      where: { id },
      data: {
        designation: updates.designation,
        singleBeds: updates.singleBeds,
        doubleBeds: updates.doubleBeds,
        bathrooms: updates.bathrooms,
        hasAirControl: updates.hasAirControl,
        parkingSpaces: updates.parkingSpaces,
        isActive: updates.isActive,
      }
    });

    return this.mapToEntity(room);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.roomUnit.delete({
      where: { id }
    });
  }

  async findAvailableRooms(checkIn: Date, checkOut: Date): Promise<RoomEntity[]> {
    const rooms = await this.prisma.roomUnit.findMany({
      where: {
        isActive: true,
        reservations: {
          none: {
            OR: [
              {
                AND: [
                  { arrivalDate: { lte: checkIn } },
                  { departDate: { gt: checkIn } }
                ]
              },
              {
                AND: [
                  { arrivalDate: { lt: checkOut } },
                  { departDate: { gte: checkOut } }
                ]
              },
              {
                AND: [
                  { arrivalDate: { gte: checkIn } },
                  { departDate: { lte: checkOut } }
                ]
              }
            ]
          }
        }
      },
      orderBy: { designation: 'asc' }
    });

    return rooms.map(this.mapToEntity);
  }

  async findByDesignation(designation: string): Promise<RoomEntity | null> {
    const room = await this.prisma.roomUnit.findFirst({
      where: { designation }
    });

    return room ? this.mapToEntity(room) : null;
  }

  async findActiveRooms(): Promise<RoomEntity[]> {
    const rooms = await this.prisma.roomUnit.findMany({
      where: { isActive: true },
      orderBy: { designation: 'asc' }
    });

    return rooms.map(this.mapToEntity);
  }

  async findInactiveRooms(): Promise<RoomEntity[]> {
    const rooms = await this.prisma.roomUnit.findMany({
      where: { isActive: false },
      orderBy: { designation: 'asc' }
    });

    return rooms.map(this.mapToEntity);
  }

  async findWithPagination(options: PaginationOptions): Promise<PaginatedResult<RoomEntity>> {
    const { search } = options;

    const whereClause: Prisma.RoomUnitWhereInput = search
      ? {
          designation: { contains: search, mode: 'insensitive' }
        }
      : {};

    const result = await this.findWithPaginationBase(options, whereClause);

    return {
      ...result,
      data: result.data.map(this.mapToEntity)
    };
  }

  async createStandardRooms(): Promise<RoomEntity[]> {
    const standardRooms = [
      {
        designation: 'Premium Individual Suite',
        singleBeds: 1,
        doubleBeds: 0,
        bathrooms: 1,
        hasAirControl: true,
        parkingSpaces: 0,
      },
      {
        designation: 'Individual Suite with Parking',
        singleBeds: 0,
        doubleBeds: 1,
        bathrooms: 1,
        hasAirControl: true,
        parkingSpaces: 1,
      },
      {
        designation: 'Romantic Couple Suite',
        singleBeds: 0,
        doubleBeds: 1,
        bathrooms: 1,
        hasAirControl: true,
        parkingSpaces: 1,
      },
      {
        designation: 'Family Suite for up to 2 children',
        singleBeds: 2,
        doubleBeds: 1,
        bathrooms: 1,
        hasAirControl: true,
        parkingSpaces: 1,
      },
      {
        designation: 'Deluxe Family Suite for up to 5 children',
        singleBeds: 5,
        doubleBeds: 1,
        bathrooms: 2,
        hasAirControl: true,
        parkingSpaces: 2,
      },
      {
        designation: 'Premium Family Suite for 2 families, couple + 3 children each',
        singleBeds: 6,
        doubleBeds: 2,
        bathrooms: 3,
        hasAirControl: true,
        parkingSpaces: 2,
      },
    ];

    const createdRooms = [];
    
    for (const roomData of standardRooms) {
      const room = await this.prisma.roomUnit.create({
        data: roomData
      });
      createdRooms.push(this.mapToEntity(room));
    }

    return createdRooms;
  }

  private mapToEntity(room: any): RoomEntity {
    return new RoomEntity(
      room.id,
      room.designation,
      room.singleBeds,
      room.doubleBeds,
      room.bathrooms,
      room.hasAirControl,
      room.parkingSpaces,
      room.isActive,
      room.createdAt,
      room.updatedAt
    );
  }
}