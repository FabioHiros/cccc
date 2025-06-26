// src/infrastructure/database/repositories/booking.repository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { BookingEntity } from '../../../core/entities/booking.entity';
import { BookingStatus } from '../../../core/enums/booking-status.enum';
import { IBookingRepository } from '../../../core/interfaces/repositories/booking.repository.interface';
import { BaseRepository } from './base.repository';
import { PaginationOptions, PaginatedResult } from '../../../core/interfaces/repositories/base.repository.interface';

export class BookingRepository extends BaseRepository<BookingEntity> implements IBookingRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'reservation');
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      }
    });

    return booking ? this.mapToEntity(booking) : null;
  }

  async findAll(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.reservation.findMany({
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return bookings.map(this.mapToEntity);
  }

  async create(entity: Omit<BookingEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingEntity> {
    const booking = await this.prisma.reservation.create({
      data: {
        primaryId: entity.primaryId,
        roomId: entity.roomId,
        arrivalDate: entity.arrivalDate,
        departDate: entity.departDate,
        status: entity.status,
        totalAmount: entity.totalAmount,
        notes: entity.notes,
      },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      }
    });

    return this.mapToEntity(booking);
  }

  async update(id: string, updates: Partial<BookingEntity>): Promise<BookingEntity> {
    const booking = await this.prisma.reservation.update({
      where: { id },
      data: {
        roomId: updates.roomId,
        arrivalDate: updates.arrivalDate,
        departDate: updates.departDate,
        status: updates.status,
        totalAmount: updates.totalAmount,
        notes: updates.notes,
      },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      }
    });

    return this.mapToEntity(booking);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reservation.delete({
      where: { id }
    });
  }

  async findByPrimaryGuestId(primaryGuestId: string): Promise<BookingEntity[]> {
    const bookings = await this.prisma.reservation.findMany({
      where: { primaryId: primaryGuestId },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      },
      orderBy: { arrivalDate: 'desc' }
    });

    return bookings.map(this.mapToEntity);
  }

  async findByRoomId(roomId: string): Promise<BookingEntity[]> {
    const bookings = await this.prisma.reservation.findMany({
      where: { roomId },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      },
      orderBy: { arrivalDate: 'desc' }
    });

    return bookings.map(this.mapToEntity);
  }

  async findByStatus(status: BookingStatus): Promise<BookingEntity[]> {
    const bookings = await this.prisma.reservation.findMany({
      where: { status },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      },
      orderBy: { arrivalDate: 'desc' }
    });

    return bookings.map(this.mapToEntity);
  }

  async findActiveBookings(): Promise<BookingEntity[]> {
    const today = new Date();
    
    const bookings = await this.prisma.reservation.findMany({
      where: {
        arrivalDate: { lte: today },
        departDate: { gte: today },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] }
      },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      },
      orderBy: { arrivalDate: 'asc' }
    });

    return bookings.map(this.mapToEntity);
  }

  async findUpcomingBookings(): Promise<BookingEntity[]> {
    const today = new Date();
    
    const bookings = await this.prisma.reservation.findMany({
      where: {
        arrivalDate: { gt: today },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
      },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      },
      orderBy: { arrivalDate: 'asc' }
    });

    return bookings.map(this.mapToEntity);
  }

  async findPastBookings(): Promise<BookingEntity[]> {
    const today = new Date();
    
    const bookings = await this.prisma.reservation.findMany({
      where: {
        departDate: { lt: today },
      },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      },
      orderBy: { departDate: 'desc' }
    });

    return bookings.map(this.mapToEntity);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<BookingEntity[]> {
    const bookings = await this.prisma.reservation.findMany({
      where: {
        OR: [
          {
            AND: [
              { arrivalDate: { gte: startDate } },
              { arrivalDate: { lte: endDate } }
            ]
          },
          {
            AND: [
              { departDate: { gte: startDate } },
              { departDate: { lte: endDate } }
            ]
          },
          {
            AND: [
              { arrivalDate: { lte: startDate } },
              { departDate: { gte: endDate } }
            ]
          }
        ]
      },
      include: {
        primary: {
          include: {
            documents: true,
            contacts: true,
            address: true,
          }
        },
        room: true,
      },
      orderBy: { arrivalDate: 'asc' }
    });

    return bookings.map(this.mapToEntity);
  }

  async checkRoomAvailability(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    const conflictingBooking = await this.prisma.reservation.findFirst({
      where: {
        roomId,
        status: { not: BookingStatus.CANCELLED },
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
    });

    return !conflictingBooking;
  }

  async findWithPagination(options: PaginationOptions): Promise<PaginatedResult<BookingEntity>> {
    const { search } = options;

    const whereClause: Prisma.ReservationWhereInput = search
      ? {
          OR: [
            {
              primary: {
                OR: [
                  { fullName: { contains: search, mode: 'insensitive' } },
                  { displayName: { contains: search, mode: 'insensitive' } },
                ]
              }
            },
            {
              room: {
                designation: { contains: search, mode: 'insensitive' }
              }
            }
          ]
        }
      : {};

    const includeClause = {
      primary: {
        include: {
          documents: true,
          contacts: true,
          address: true,
        }
      },
      room: true,
    };

    const result = await this.findWithPaginationBase(options, whereClause, includeClause);

    return {
      ...result,
      data: result.data.map(this.mapToEntity)
    };
  }

  private mapToEntity(booking: any): BookingEntity {
    const entity = new BookingEntity(
      booking.id,
      booking.primaryId,
      booking.roomId,
      booking.arrivalDate,
      booking.departDate,
      booking.status,
      booking.totalAmount ? Number(booking.totalAmount) : undefined,
      booking.notes,
      booking.createdAt,
      booking.updatedAt
    );

    if (booking.primary) {
      entity.primary = {
        id: booking.primary.id,
        fullName: booking.primary.fullName,
        displayName: booking.primary.displayName,
        birthDate: booking.primary.birthDate,
        registrationDate: booking.primary.registrationDate,
        primaryGuestId: booking.primary.primaryGuestId,
        address: booking.primary.address,
        documents: booking.primary.documents || [],
        contacts: booking.primary.contacts || [],
        companions: [],
        createdAt: booking.primary.createdAt,
        updatedAt: booking.primary.updatedAt,
      } as any;
    }

    if (booking.room) {
      entity.room = {
        id: booking.room.id,
        designation: booking.room.designation,
        singleBeds: booking.room.singleBeds,
        doubleBeds: booking.room.doubleBeds,
        bathrooms: booking.room.bathrooms,
        hasAirControl: booking.room.hasAirControl,
        parkingSpaces: booking.room.parkingSpaces,
        isActive: booking.room.isActive,
        createdAt: booking.room.createdAt,
        updatedAt: booking.room.updatedAt,
      } as any;
    }

    return entity;
  }
}