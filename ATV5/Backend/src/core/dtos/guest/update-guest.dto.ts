// src/core/dtos/guest/update-guest.dto.ts
import { DocumentType } from '../../enums/document-type.enum';

export interface UpdateGuestDto {
  fullName?: string;
  displayName?: string;
  birthDate?: string; // ISO date string
  
  address?: {
    street?: string;
    district?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
  };
  
  contact?: {
    areaCode?: string;
    number?: string;
  };
  
  document?: {
    category?: DocumentType;
    identifier?: string;
    issuedDate?: string; // ISO date string
  };
}