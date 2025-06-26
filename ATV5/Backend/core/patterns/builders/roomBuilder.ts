import { RoomUnit, PrismaClient } from '@prisma/client';
import IBuilder from './iBuilder';

export interface RoomConfiguration {
  designation: string;
  singleBeds: number;
  doubleBeds: number;
  bathrooms: number;
  hasAirControl: boolean;
  parkingSpaces: number;
}

export default class RoomUnitBuilder implements IBuilder<Promise<RoomUnit>> {
  private designation: string = '';
  private singleBeds: number = 0;
  private doubleBeds: number = 0;
  private bathrooms: number = 0;
  private hasAirControl: boolean = false;
  private parkingSpaces: number = 0;
  private database: PrismaClient;

  constructor(database: PrismaClient) {
    this.database = database;
  }

  public withDesignation(designation: string): RoomUnitBuilder {
    this.designation = designation;
    return this;
  }

  public withSingleBeds(count: number): RoomUnitBuilder {
    this.singleBeds = count;
    return this;
  }

  public withDoubleBeds(count: number): RoomUnitBuilder {
    this.doubleBeds = count;
    return this;
  }

  public withBathrooms(count: number): RoomUnitBuilder {
    this.bathrooms = count;
    return this;
  }

  public withAirControl(enabled: boolean): RoomUnitBuilder {
    this.hasAirControl = enabled;
    return this;
  }

  public withParkingSpaces(count: number): RoomUnitBuilder {
    this.parkingSpaces = count;
    return this;
  }

  async construct(): Promise<RoomUnit> {
    return this.database.roomUnit.create({
      data: {
        designation: this.designation,
        singleBeds: this.singleBeds,
        doubleBeds: this.doubleBeds,
        bathrooms: this.bathrooms,
        hasAirControl: this.hasAirControl,
        parkingSpaces: this.parkingSpaces
      }
    });
  }
}