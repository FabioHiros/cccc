// src/core/entities/guest.entity.ts
import { BaseEntity } from './base.entity';
import { DocumentType } from '../enums/document-type.enum';

export interface GuestAddress {
  id: string;
  street: string;
  district: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

export interface GuestDocument {
  id: string;
  category: DocumentType;
  identifier: string;
  issuedDate: Date;
}

export interface GuestContact {
  id: string;
  areaCode: string;
  number: string;
}

export class GuestEntity extends BaseEntity {
  public fullName: string;
  public displayName: string;
  public birthDate: Date;
  public registrationDate: Date;
  public primaryGuestId?: string;
  
  // Relations
  public address?: GuestAddress;
  public documents: GuestDocument[];
  public contacts: GuestContact[];
  public companions: GuestEntity[];

  constructor(
    id: string,
    fullName: string,
    displayName: string,
    birthDate: Date,
    primaryGuestId?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.fullName = fullName;
    this.displayName = displayName;
    this.birthDate = birthDate;
    this.registrationDate = createdAt || new Date();
    this.primaryGuestId = primaryGuestId;
    this.documents = [];
    this.contacts = [];
    this.companions = [];
  }

  public isPrimaryGuest(): boolean {
    return !this.primaryGuestId;
  }

  public addDocument(document: GuestDocument): void {
    this.documents.push(document);
    this.updateTimestamp();
  }

  public addContact(contact: GuestContact): void {
    this.contacts.push(contact);
    this.updateTimestamp();
  }

  public getAge(): number {
    const today = new Date();
    const age = today.getFullYear() - this.birthDate.getFullYear();
    const monthDiff = today.getMonth() - this.birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }
}