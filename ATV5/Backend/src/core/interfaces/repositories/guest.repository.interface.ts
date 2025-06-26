// src/core/interfaces/repositories/guest.repository.interface.ts - ADDED UPDATE METHODS
import { IBaseRepository, PaginationOptions, PaginatedResult } from './base.repository.interface';
import { GuestEntity } from '../../entities/guest.entity';

export interface IGuestRepository extends IBaseRepository<GuestEntity> {
  // Existing methods
  findPrimaryGuests(): Promise<GuestEntity[]>;
  findCompanions(primaryGuestId: string): Promise<GuestEntity[]>;
  findAllCompanions(): Promise<GuestEntity[]>;
  findByDocument(documentIdentifier: string): Promise<GuestEntity | null>;
  findWithPagination(options: PaginationOptions): Promise<PaginatedResult<GuestEntity>>;

  // Address methods
  updateGuestAddress(guestId: string, addressData: {
    street?: string;
    district?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
  }): Promise<void>;

  // Document methods
  addDocumentToGuest(guestId: string, documentData: {
    category: string;
    identifier: string;
    issuedDate: Date;
  }): Promise<void>;

  // NEW: Update document method
  updateGuestDocument(guestId: string, documentId: string, documentData: {
    category: string;
    identifier: string;
    issuedDate: Date;
  }): Promise<void>;

  // Contact methods
  addContactToGuest(guestId: string, contactData: {
    areaCode: string;
    number: string;
  }): Promise<void>;

  // NEW: Update contact method
  updateGuestContact(guestId: string, contactId: string, contactData: {
    areaCode: string;
    number: string;
  }): Promise<void>;
}