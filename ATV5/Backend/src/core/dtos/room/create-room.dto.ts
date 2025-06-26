// src/core/dtos/room/create-room.dto.ts
export interface CreateRoomDto {
  designation: string;
  singleBeds: number;
  doubleBeds: number;
  bathrooms: number;
  hasAirControl: boolean;
  parkingSpaces: number;
}