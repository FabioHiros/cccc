// src/shared/exceptions/not-found.exception.ts
import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(
    resource: string,
    identifier?: string | number,
    context?: string,
    metadata?: any
  ) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(message, 404, context, metadata);
  }

  /**
   * Create a NotFoundException for a guest
   */
  static guest(guestId: string): NotFoundException {
    return new NotFoundException('Guest', guestId, 'GUEST_SERVICE');
  }

  /**
   * Create a NotFoundException for a room
   */
  static room(roomId: string): NotFoundException {
    return new NotFoundException('Room', roomId, 'ROOM_SERVICE');
  }

  /**
   * Create a NotFoundException for a booking
   */
  static booking(bookingId: string): NotFoundException {
    return new NotFoundException('Booking', bookingId, 'BOOKING_SERVICE');
  }

  /**
   * Create a NotFoundException for a primary guest
   */
  static primaryGuest(guestId: string): NotFoundException {
    return new NotFoundException(
      'Primary guest', 
      guestId, 
      'GUEST_SERVICE',
      { guestType: 'primary' }
    );
  }

  /**
   * Create a NotFoundException for companions
   */
  static companions(primaryGuestId: string): NotFoundException {
    return new NotFoundException(
      'Companions',
      undefined,
      'GUEST_SERVICE',
      { primaryGuestId, guestType: 'companions' }
    );
  }

  /**
   * Create a NotFoundException for an address
   */
  static address(guestId: string): NotFoundException {
    return new NotFoundException(
      'Address',
      undefined,
      'GUEST_SERVICE',
      { guestId }
    );
  }

  /**
   * Create a NotFoundException for available rooms
   */
  static availableRooms(checkIn: Date, checkOut: Date): NotFoundException {
    return new NotFoundException(
      'Available rooms',
      undefined,
      'ROOM_SERVICE',
      { checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString() }
    );
  }

  /**
   * Create a generic NotFoundException
   */
  static generic(resource: string, identifier?: string | number): NotFoundException {
    return new NotFoundException(resource, identifier);
  }
}