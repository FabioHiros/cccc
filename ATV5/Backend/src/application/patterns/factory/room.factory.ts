// src/application/patterns/factory/room.factory.ts
import { RoomEntity } from '../../../core/entities/room.entity';

export enum RoomType {
  INDIVIDUAL = 'INDIVIDUAL',
  INDIVIDUAL_PLUS = 'INDIVIDUAL_PLUS', 
  COUPLE = 'COUPLE',
  FAMILY_BASIC = 'FAMILY_BASIC',
  FAMILY_DELUXE = 'FAMILY_DELUXE',
  FAMILY_PREMIUM = 'FAMILY_PREMIUM'
}

export class RoomFactory {
  static createRoom(type: RoomType, id: string = ''): RoomEntity {
    switch (type) {
      case RoomType.INDIVIDUAL:
        return new RoomEntity(
          id,
          'Premium Individual Suite',
          1, // singleBeds
          0, // doubleBeds
          1, // bathrooms
          true, // hasAirControl
          0 // parkingSpaces
        );

      case RoomType.INDIVIDUAL_PLUS:
        return new RoomEntity(
          id,
          'Individual Suite with Parking',
          0,
          1,
          1,
          true,
          1
        );

      case RoomType.COUPLE:
        return new RoomEntity(
          id,
          'Romantic Couple Suite',
          0,
          1,
          1,
          true,
          1
        );

      case RoomType.FAMILY_BASIC:
        return new RoomEntity(
          id,
          'Family Suite for up to 2 children',
          2,
          1,
          1,
          true,
          1
        );

      case RoomType.FAMILY_DELUXE:
        return new RoomEntity(
          id,
          'Deluxe Family Suite for up to 5 children',
          5,
          1,
          2,
          true,
          2
        );

      case RoomType.FAMILY_PREMIUM:
        return new RoomEntity(
          id,
          'Premium Family Suite for 2 families, couple + 3 children each',
          6,
          2,
          3,
          true,
          2
        );

      default:
        throw new Error(`Unknown room type: ${type}`);
    }
  }

  static createCustomRoom(
    id: string,
    designation: string,
    singleBeds: number,
    doubleBeds: number,
    bathrooms: number,
    hasAirControl: boolean,
    parkingSpaces: number
  ): RoomEntity {
    return new RoomEntity(
      id,
      designation,
      singleBeds,
      doubleBeds,
      bathrooms,
      hasAirControl,
      parkingSpaces
    );
  }

  static getAllStandardRoomTypes(): RoomType[] {
    return Object.values(RoomType);
  }

  static createAllStandardRooms(): RoomEntity[] {
    return this.getAllStandardRoomTypes().map(type => this.createRoom(type));
  }
}