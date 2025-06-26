import { PrismaClient, RoomUnit } from '@prisma/client';
import RoomUnitBuilder from '../builders/roomBuilder';

export abstract class BaseRoomDirector {
  protected builder: RoomUnitBuilder;

  constructor(database: PrismaClient) {
    this.builder = new RoomUnitBuilder(database);
  }

  abstract construct(config?: any): Promise<RoomUnit>;
}

export class IndividualRoomDirector extends BaseRoomDirector {
  async construct(): Promise<RoomUnit> {
    return this.builder
      .withDesignation('Premium Individual Suite')
      .withSingleBeds(1)
      .withDoubleBeds(0)
      .withBathrooms(1)
      .withAirControl(true)
      .withParkingSpaces(0)
      .construct();
  }
}

export class IndividualPlusRoomDirector extends BaseRoomDirector {
  async construct(): Promise<RoomUnit> {
    return this.builder
      .withDesignation('Individual Suite with Parking')
      .withSingleBeds(0)
      .withDoubleBeds(1)
      .withBathrooms(1)
      .withAirControl(true)
      .withParkingSpaces(1)
      .construct();
  }
}

export class CoupleRoomDirector extends BaseRoomDirector {
  async construct(): Promise<RoomUnit> {
    return this.builder
      .withDesignation('Romantic Couple Suite')
      .withSingleBeds(0)
      .withDoubleBeds(1)
      .withBathrooms(1)
      .withAirControl(true)
      .withParkingSpaces(1)
      .construct();
  }
}

export class FamilyBasicDirector extends BaseRoomDirector {
  async construct(): Promise<RoomUnit> {
    return this.builder
      .withDesignation('Family Suite for up to 2 children')
      .withSingleBeds(2)
      .withDoubleBeds(1)
      .withBathrooms(1)
      .withAirControl(true)
      .withParkingSpaces(1)
      .construct();
  }
}

export class FamilyDeluxeDirector extends BaseRoomDirector {
  async construct(): Promise<RoomUnit> {
    return this.builder
      .withDesignation('Deluxe Family Suite for up to 5 children')
      .withSingleBeds(5)
      .withDoubleBeds(1)
      .withBathrooms(2)
      .withAirControl(true)
      .withParkingSpaces(2)
      .construct();
  }
}

export class FamilyPremiumDirector extends BaseRoomDirector {
  async construct(): Promise<RoomUnit> {
    return this.builder
      .withDesignation('Premium Family Suite for 2 families, couple + 3 children each')
      .withSingleBeds(6)
      .withDoubleBeds(2)
      .withBathrooms(3)
      .withAirControl(true)
      .withParkingSpaces(2)
      .construct();
  }
}

export class CustomRoomDirector extends BaseRoomDirector {
  async construct(config?: {
    designation: string;
    singleBeds: number;
    doubleBeds: number;
    bathrooms: number;
    hasAirControl: boolean;
    parkingSpaces: number;
  }): Promise<RoomUnit> {
    if (!config) {
      throw new Error("Configuration required for CustomRoomDirector");
    }
    
    return this.builder
      .withDesignation(config.designation)
      .withSingleBeds(config.singleBeds)
      .withDoubleBeds(config.doubleBeds)
      .withBathrooms(config.bathrooms)
      .withAirControl(config.hasAirControl)
      .withParkingSpaces(config.parkingSpaces)
      .construct();
  }
}