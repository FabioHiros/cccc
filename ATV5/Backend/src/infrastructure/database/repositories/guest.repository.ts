// src/infrastructure/database/repositories/guest.repository.ts - ADDED UPDATE METHODS
import { PrismaClient, Prisma } from '@prisma/client';
import { GuestEntity } from '../../../core/entities/guest.entity';
import { IGuestRepository } from '../../../core/interfaces/repositories/guest.repository.interface';
import { BaseRepository } from './base.repository';
import { PaginationOptions, PaginatedResult } from '../../../core/interfaces/repositories/base.repository.interface';

export class GuestRepository extends BaseRepository<GuestEntity> implements IGuestRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'guest');
  }

  async findById(id: string): Promise<GuestEntity | null> {
    if (!id) {
      throw new Error('Guest ID is required');
    }

    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: {
        documents: true,
        contacts: true,
        address: true,
        companions: {
          include: {
            documents: true,
            contacts: true,
          }
        }
      }
    });

    return guest ? this.mapToEntity(guest) : null;
  }

  async findAll(): Promise<GuestEntity[]> {
    const guests = await this.prisma.guest.findMany({
      include: {
        documents: true,
        contacts: true,
        address: true,
        companions: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return guests.map(guest => this.mapToEntity(guest));
  }


async create(entity: Omit<GuestEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<GuestEntity> {
  const guest = await this.prisma.guest.create({
    data: {
      fullName: entity.fullName,
      displayName: entity.displayName,
      birthDate: entity.birthDate,
      primaryGuest: entity.primaryGuestId ? {
        connect: { id: entity.primaryGuestId }
      } : undefined,
      address: entity.address ? {
        create: {
          street: entity.address.street,
          district: entity.address.district,
          city: entity.address.city,
          region: entity.address.region,
          country: entity.address.country,
          postalCode: entity.address.postalCode,
        }
      } : undefined,
    },
    include: {
      documents: true,
      contacts: true,
      address: true,
      companions: true,
    }
  });

  return this.mapToEntity(guest);
}

  async update(id: string, updates: Partial<GuestEntity>): Promise<GuestEntity> {
    if (!id) {
      throw new Error('Guest ID is required');
    }

    const guest = await this.prisma.guest.update({
      where: { id },
      data: {
        fullName: updates.fullName,
        displayName: updates.displayName,
        birthDate: updates.birthDate,
      },
      include: {
        documents: true,
        contacts: true,
        address: true,
        companions: true,
      }
    });

    return this.mapToEntity(guest);
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('Guest ID is required');
    }

    await this.prisma.guest.delete({
      where: { id }
    });
  }

  async findPrimaryGuests(): Promise<GuestEntity[]> {
    const guests = await this.prisma.guest.findMany({
      where: { primaryGuestId: null },
      include: {
        documents: true,
        contacts: true,
        address: true,
        companions: {
          include: {
            documents: true,
            contacts: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return guests.map(guest => this.mapToEntity(guest));
  }

  async findCompanions(primaryGuestId: string): Promise<GuestEntity[]> {
    if (!primaryGuestId) {
      throw new Error('Primary guest ID is required');
    }

    const companions = await this.prisma.guest.findMany({
      where: { primaryGuestId },
      include: {
        documents: true,
        contacts: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return companions.map(guest => this.mapToEntity(guest));
  }

  async findAllCompanions(): Promise<GuestEntity[]> {
    const companions = await this.prisma.guest.findMany({
      where: {
        NOT: {
          primaryGuestId: null
        }
      },
      include: {
        documents: true,
        contacts: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return companions.map(guest => this.mapToEntity(guest));
  }

  async findByDocument(documentIdentifier: string): Promise<GuestEntity | null> {
    if (!documentIdentifier) {
      throw new Error('Document identifier is required');
    }

    const guestWithDocument = await this.prisma.guest.findFirst({
      where: {
        documents: {
          some: {
            identifier: documentIdentifier
          }
        }
      },
      include: {
        documents: true,
        contacts: true,
        address: true,
        companions: true,
      }
    });

    return guestWithDocument ? this.mapToEntity(guestWithDocument) : null;
  }

  async findWithPagination(options: PaginationOptions): Promise<PaginatedResult<GuestEntity>> {
    const { search } = options;

    const whereClause: Prisma.GuestWhereInput = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { displayName: { contains: search, mode: 'insensitive' } },
          ]
        }
      : {};

    const includeClause = {
      documents: true,
      contacts: true,
      address: true,
      companions: true,
    };

    const result = await this.findWithPaginationBase(options, whereClause, includeClause);

    return {
      ...result,
      data: result.data.map(guest => this.mapToEntity(guest))
    };
  }

  async addDocumentToGuest(guestId: string, documentData: {
    category: string;
    identifier: string;
    issuedDate: Date;
  }): Promise<void> {
    if (!guestId) {
      throw new Error('Guest ID is required');
    }

    await this.prisma.documentation.create({
      data: {
        category: documentData.category,
        identifier: documentData.identifier,
        issuedDate: documentData.issuedDate,
        guestId: guestId,
      }
    });
  }

  // NEW: Update existing document
  async updateGuestDocument(guestId: string, documentId: string, documentData: {
    category: string;
    identifier: string;
    issuedDate: Date;
  }): Promise<void> {
    if (!guestId || !documentId) {
      throw new Error('Guest ID and Document ID are required');
    }

    await this.prisma.documentation.update({
      where: { 
        id: documentId,
        guestId: guestId // Ensure the document belongs to this guest
      },
      data: {
        category: documentData.category,
        identifier: documentData.identifier,
        issuedDate: documentData.issuedDate,
      }
    });
  }

  async addContactToGuest(guestId: string, contactData: {
    areaCode: string;
    number: string;
  }): Promise<void> {
    if (!guestId) {
      throw new Error('Guest ID is required');
    }

    await this.prisma.contactInfo.create({
      data: {
        areaCode: contactData.areaCode,
        number: contactData.number,
        guestId: guestId,
      }
    });
  }

  // NEW: Update existing contact
  async updateGuestContact(guestId: string, contactId: string, contactData: {
    areaCode: string;
    number: string;
  }): Promise<void> {
    if (!guestId || !contactId) {
      throw new Error('Guest ID and Contact ID are required');
    }

    await this.prisma.contactInfo.update({
      where: { 
        id: contactId,
        guestId: guestId // Ensure the contact belongs to this guest
      },
      data: {
        areaCode: contactData.areaCode,
        number: contactData.number,
      }
    });
  }

  async updateGuestAddress(guestId: string, addressData: {
    street?: string;
    district?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
  }): Promise<void> {
    if (!guestId) {
      throw new Error('Guest ID is required');
    }

    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      select: { addressId: true }
    });

    if (!guest?.addressId) {
      // Create new address
      await this.prisma.guest.update({
        where: { id: guestId },
        data: {
          address: {
            create: addressData
          }
        }
      });
    } else {
      // Update existing address
      await this.prisma.address.update({
        where: { id: guest.addressId },
        data: addressData
      });
    }
  }

  private mapToEntity(guest: any): GuestEntity {
    if (!guest) {
      throw new Error('Cannot map null/undefined guest to entity');
    }

    const entity = new GuestEntity(
      guest.id,
      guest.fullName,
      guest.displayName,
      guest.birthDate,
      guest.primaryGuestId,
      guest.createdAt,
      guest.updatedAt
    );

    if (guest.address) {
      entity.address = {
        id: guest.address.id,
        street: guest.address.street,
        district: guest.address.district,
        city: guest.address.city,
        region: guest.address.region,
        country: guest.address.country,
        postalCode: guest.address.postalCode,
      };
    }

    entity.documents = guest.documents?.map((doc: any) => ({
      id: doc.id,
      category: doc.category,
      identifier: doc.identifier,
      issuedDate: doc.issuedDate,
    })) || [];

    entity.contacts = guest.contacts?.map((contact: any) => ({
      id: contact.id,
      areaCode: contact.areaCode,
      number: contact.number,
    })) || [];

    entity.companions = guest.companions?.map((companion: any) => this.mapToEntity(companion)) || [];

    return entity;
  }
}