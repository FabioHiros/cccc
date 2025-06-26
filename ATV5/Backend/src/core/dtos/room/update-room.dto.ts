// src/core/dtos/room/update-room.dto.ts
export interface UpdateRoomDto {
  designation?: string;
  singleBeds?: number;
  doubleBeds?: number;
  bathrooms?: number;
  hasAirControl?: boolean;
  parkingSpaces?: number;
  isActive?: boolean;
}