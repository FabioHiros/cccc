import { PrismaClient, RoomUnit } from '@prisma/client';
import { 
  IndividualRoomDirector, 
  IndividualPlusRoomDirector, 
  CoupleRoomDirector, 
  FamilyBasicDirector, 
  FamilyDeluxeDirector, 
  FamilyPremiumDirector, 
  CustomRoomDirector 
} from '../patterns/directors/roomDirectors';

export class RoomManagementLogic {
  private database: PrismaClient;

  constructor(database: PrismaClient) {
    this.database = database;
  }

  async retrieveAllRooms(): Promise<RoomUnit[]> {
    return this.database.roomUnit.findMany();
  }

  async retrieveRoomById(id: string): Promise<RoomUnit | null> {
    return this.database.roomUnit.findUnique({
      where: { id }
    });
  }

  async generateStandardRooms(): Promise<RoomUnit[]> {
    const directors = [
      new IndividualRoomDirector(this.database),
      new IndividualPlusRoomDirector(this.database),
      new CoupleRoomDirector(this.database),
      new FamilyBasicDirector(this.database),
      new FamilyDeluxeDirector(this.database),
      new FamilyPremiumDirector(this.database),
    ];

    const rooms = [];
    for (const director of directors) {
      const room = await director.construct();
      rooms.push(room);
    }

    return rooms;
  }

  async generateCustomRoom(configuration: {
    designation: string;
    singleBeds: number;
    doubleBeds: number;
    bathrooms: number;
    hasAirControl: boolean;
    parkingSpaces: number;
  }): Promise<RoomUnit> {
    const director = new CustomRoomDirector(this.database);
    return director.construct(configuration);
  }

  async modifyRoom(id: string, updateData: {
    designation?: string;
    singleBeds?: number;
    doubleBeds?: number;
    bathrooms?: number;
    hasAirControl?: boolean;
    parkingSpaces?: number;
  }): Promise<RoomUnit> {
    return this.database.roomUnit.update({
      where: { id },
      data: updateData
    });
  }

  async removeRoom(id: string): Promise<RoomUnit> {
    return this.database.roomUnit.delete({
      where: { id }
    });
  }
}