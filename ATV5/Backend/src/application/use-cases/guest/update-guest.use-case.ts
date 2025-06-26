// src/application/use-cases/guest/update-guest.use-case.ts - FIXED TO UPDATE INSTEAD OF ADD
import { IGuestRepository } from '../../../core/interfaces/repositories/guest.repository.interface';
import { GuestEntity } from '../../../core/entities/guest.entity';
import { UpdateGuestDto } from '../../../core/dtos/guest/update-guest.dto';

export class UpdateGuestUseCase {
  constructor(private readonly guestRepository: IGuestRepository) {}

  async execute(id: string, updateGuestDto: UpdateGuestDto): Promise<GuestEntity> {
    // Check if guest exists
    const existingGuest = await this.guestRepository.findById(id);
    if (!existingGuest) {
      throw new Error('Guest not found');
    }

    // Update basic guest information
    const updatedGuest = await this.guestRepository.update(id, {
      fullName: updateGuestDto.fullName,
      displayName: updateGuestDto.displayName,
      birthDate: updateGuestDto.birthDate ? new Date(updateGuestDto.birthDate) : undefined,
    });

    // Update address if provided
    if (updateGuestDto.address) {
      await this.guestRepository.updateGuestAddress(id, updateGuestDto.address);
    }

    // Handle contact update/replacement
    if (updateGuestDto.contact?.areaCode && updateGuestDto.contact?.number) {
      // Check if guest already has contacts
      if (existingGuest.contacts && existingGuest.contacts.length > 0) {
        // Update the first contact (replace it)
        await this.guestRepository.updateGuestContact(id, existingGuest.contacts[0].id, {
          areaCode: updateGuestDto.contact.areaCode,
          number: updateGuestDto.contact.number
        });
      } else {
        // Add new contact if none exists
        await this.guestRepository.addContactToGuest(id, {
          areaCode: updateGuestDto.contact.areaCode,
          number: updateGuestDto.contact.number
        });
      }
    }

    // Handle document update/replacement
    if (updateGuestDto.document?.identifier) {
      // Check for duplicate document (only if it's different from existing)
      const existingDocWithSameNumber = await this.guestRepository.findByDocument(updateGuestDto.document.identifier);
      if (existingDocWithSameNumber && existingDocWithSameNumber.id !== id) {
        throw new Error(`Document ${updateGuestDto.document.identifier} is already registered to another guest`);
      }

      // Check if guest already has documents
      if (existingGuest.documents && existingGuest.documents.length > 0) {
        // Update the first document (replace it)
        await this.guestRepository.updateGuestDocument(id, existingGuest.documents[0].id, {
          category: updateGuestDto.document.category!,
          identifier: updateGuestDto.document.identifier,
          issuedDate: new Date(updateGuestDto.document.issuedDate!)
        });
      } else {
        // Add new document if none exists
        await this.guestRepository.addDocumentToGuest(id, {
          category: updateGuestDto.document.category!,
          identifier: updateGuestDto.document.identifier,
          issuedDate: new Date(updateGuestDto.document.issuedDate!)
        });
      }
    }

    // Return the complete updated guest
    return this.guestRepository.findById(id) as Promise<GuestEntity>;
  }
}