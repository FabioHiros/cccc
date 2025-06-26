import { PrismaClient, Guest, Documentation, ContactInfo, Address } from '@prisma/client';
import { 
  DocumentationProcessor, 
  NationalIdStrategy, 
  StateIdStrategy, 
  InternationalIdStrategy 
} from '../patterns/strategies/documentationStrategy';

export class GuestBusinessLogic {
  private database: PrismaClient;
  private docProcessor: DocumentationProcessor;

  constructor(database: PrismaClient) {
    this.database = database;
    this.docProcessor = new DocumentationProcessor(new NationalIdStrategy(database));
  }

  async retrieveAllGuests(): Promise<Guest[]> {
    return this.database.guest.findMany({
      include: {
        documents: true,
        contacts: true,
        address: true,
        companions: true
      }
    });
  }

  async retrieveGuestById(id: string): Promise<Guest | null> {
    return this.database.guest.findUnique({
      where: { id },
      include: {
        documents: true,
        contacts: true,
        address: true,
        companions: true
      }
    });
  }

  async retrieveAllPrimaryGuests(): Promise<Guest[]> {
    return this.database.guest.findMany({
      where: {
        primaryGuestId: null
      },
      include: {
        documents: true,
        contacts: true,
        address: true,
        companions: true
      }
    });
  }

  async retrieveAllCompanions(): Promise<Guest[]> {
    return this.database.guest.findMany({
      where: {
        NOT: {
          primaryGuestId: null
        }
      },
      include: {
        documents: true,
        contacts: true,
        address: true,
        primaryGuest: true
      }
    });
  }

  async retrieveCompanionsByPrimaryId(primaryId: string): Promise<Guest[]> {
    return this.database.guest.findMany({
      where: {
        primaryGuestId: primaryId
      },
      include: {
        documents: true,
        contacts: true,
        address: true
      }
    });
  }

  async registerPrimaryGuest(guestData: {
    fullName: string;
    displayName: string;
    birthDate: Date;
    address: {
      street: string;
      district: string;
      city: string;
      region: string;
      country: string;
      postalCode: string;
    };
    contact: {
      areaCode: string;
      number: string;
    };
    document: {
      category: 'CPF' | 'RG' | 'Passaporte';
      identifier: string;
      issuedDate: Date;
    };
  }): Promise<Guest> {
    const addressRecord = await this.database.address.create({
      data: guestData.address
    });

    const guestRecord = await this.database.guest.create({
      data: {
        fullName: guestData.fullName,
        displayName: guestData.displayName,
        birthDate: guestData.birthDate,
        addressId: addressRecord.id
      }
    });

    await this.database.contactInfo.create({
      data: {
        areaCode: guestData.contact.areaCode,
        number: guestData.contact.number,
        guestId: guestRecord.id
      }
    });

    switch (guestData.document.category) {
      case 'CPF':
        this.docProcessor.setStrategy(new NationalIdStrategy(this.database));
        break;
      case 'RG':
        this.docProcessor.setStrategy(new StateIdStrategy(this.database));
        break;
      case 'Passaporte':
        this.docProcessor.setStrategy(new InternationalIdStrategy(this.database));
        break;
    }

    await this.docProcessor.process({
      identifier: guestData.document.identifier,
      issuedDate: guestData.document.issuedDate,
      guestId: guestRecord.id
    });

    return this.retrieveGuestById(guestRecord.id) as Promise<Guest>;
  }

  async registerCompanion(primaryId: string, companionData: {
    fullName: string;
    displayName: string;
    birthDate: Date;
    document: {
      category: 'CPF' | 'RG' | 'Passaporte';
      identifier: string;
      issuedDate: Date;
    };
  }): Promise<Guest> {
    const primaryGuest = await this.database.guest.findUnique({
      where: { id: primaryId },
      include: { address: true }
    });

    if (!primaryGuest) {
      throw new Error('Primary guest not found');
    }

    const companionRecord = await this.database.guest.create({
      data: {
        fullName: companionData.fullName,
        displayName: companionData.displayName,
        birthDate: companionData.birthDate,
        primaryGuestId: primaryGuest.id,
        addressId: primaryGuest.addressId
      }
    });

    switch (companionData.document.category) {
      case 'CPF':
        this.docProcessor.setStrategy(new NationalIdStrategy(this.database));
        break;
      case 'RG':
        this.docProcessor.setStrategy(new StateIdStrategy(this.database));
        break;
      case 'Passaporte':
        this.docProcessor.setStrategy(new InternationalIdStrategy(this.database));
        break;
    }

    await this.docProcessor.process({
      identifier: companionData.document.identifier,
      issuedDate: companionData.document.issuedDate,
      guestId: companionRecord.id
    });

    const primaryContacts = await this.database.contactInfo.findMany({
      where: { guestId: primaryGuest.id }
    });

    for (const contact of primaryContacts) {
      await this.database.contactInfo.create({
        data: {
          areaCode: contact.areaCode,
          number: contact.number,
          guestId: companionRecord.id
        }
      });
    }

    return this.retrieveGuestById(companionRecord.id) as Promise<Guest>;
  }

  async modifyGuest(id: string, updateData: {
    fullName?: string;
    displayName?: string;
    birthDate?: Date;
  }): Promise<Guest> {
    return this.database.guest.update({
      where: { id },
      data: updateData
    });
  }

  async modifyGuestAddress(id: string, addressData: {
    street?: string;
    district?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
  }): Promise<Address> {
    const guest = await this.database.guest.findUnique({
      where: { id },
      select: { addressId: true }
    });

    if (!guest || !guest.addressId) {
      throw new Error('Guest or address not found');
    }

    return this.database.address.update({
      where: { id: guest.addressId },
      data: addressData
    });
  }

  async attachDocumentToGuest(guestId: string, documentData: {
    category: 'CPF' | 'RG' | 'Passaporte';
    identifier: string;
    issuedDate: Date;
  }): Promise<Documentation> {
    switch (documentData.category) {
      case 'CPF':
        this.docProcessor.setStrategy(new NationalIdStrategy(this.database));
        break;
      case 'RG':
        this.docProcessor.setStrategy(new StateIdStrategy(this.database));
        break;
      case 'Passaporte':
        this.docProcessor.setStrategy(new InternationalIdStrategy(this.database));
        break;
    }

    return this.docProcessor.process({
      identifier: documentData.identifier,
      issuedDate: documentData.issuedDate,
      guestId
    });
  }

  async attachContactToGuest(guestId: string, contactData: {
    areaCode: string;
    number: string;
  }): Promise<ContactInfo> {
    return this.database.contactInfo.create({
      data: {
        areaCode: contactData.areaCode,
        number: contactData.number,
        guestId
      }
    });
  }

  async removeGuest(id: string): Promise<Guest> {
    return this.database.guest.delete({
      where: { id }
    });
  }
}