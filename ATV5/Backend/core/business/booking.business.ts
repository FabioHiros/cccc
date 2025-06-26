import { PrismaClient, Reservation } from '@prisma/client';

export class BookingManagementLogic {
  private database: PrismaClient;

  constructor(database: PrismaClient) {
    this.database = database;
  }

  async retrieveAllBookings(): Promise<Reservation[]> {
    return this.database.reservation.findMany({
      include: {
        primary: {
          include: {
            documents: true
          }
        },
        room: true
      }
    });
  }

  async retrieveBookingById(id: string): Promise<Reservation | null> {
    return this.database.reservation.findUnique({
      where: { id },
      include: {
        primary: {
          include: {
            documents: true
          }
        },
        room: true
      }
    });
  }

  async retrieveBookingsByPrimaryId(primaryId: string): Promise<Reservation[]> {
    return this.database.reservation.findMany({
      where: {
        primaryId
      },
      include: {
        room: true
      }
    });
  }

  async createBooking(bookingData: {
    primaryId: string;
    roomId: string;
    arrivalDate: Date;
    departDate: Date;
  }): Promise<Reservation> {
    const primaryGuest = await this.database.guest.findUnique({
      where: { id: bookingData.primaryId }
    });

    if (!primaryGuest) {
      throw new Error('Primary guest not found');
    }

    if (primaryGuest.primaryGuestId) {
      throw new Error('Companions cannot be the primary guest of a reservation');
    }

    return this.database.reservation.create({
      data: {
        primaryId: bookingData.primaryId,
        roomId: bookingData.roomId,
        arrivalDate: bookingData.arrivalDate,
        departDate: bookingData.departDate
      },
      include: {
        primary: true,
        room: true
      }
    });
  }

  async modifyBooking(id: string, updateData: {
    roomId?: string;
    arrivalDate?: Date;
    departDate?: Date;
  }): Promise<Reservation> {
    return this.database.reservation.update({
      where: { id },
      data: updateData,
      include: {
        primary: true,
        room: true
      }
    });
  }

  async removeBooking(id: string): Promise<Reservation> {
    return this.database.reservation.delete({
      where: { id }
    });
  }
}