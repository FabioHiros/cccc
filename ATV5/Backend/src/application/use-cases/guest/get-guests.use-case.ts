// src/application/use-cases/guest/get-guests.use-case.ts
import { IGuestRepository } from '../../../core/interfaces/repositories/guest.repository.interface';
import { GuestEntity } from '../../../core/entities/guest.entity';
import { PaginationOptions, PaginatedResult } from '../../../core/interfaces/repositories/base.repository.interface';

export class GetGuestsUseCase {
  constructor(private readonly guestRepository: IGuestRepository) {}

  async execute(options?: PaginationOptions): Promise<GuestEntity[] | PaginatedResult<GuestEntity>> {
    if (options) {
      return this.guestRepository.findWithPagination(options);
    }
    
    return this.guestRepository.findAll();
  }

  async getPrimaryGuests(): Promise<GuestEntity[]> {
    return this.guestRepository.findPrimaryGuests();
  }

  async getAllCompanions(): Promise<GuestEntity[]> {
    return this.guestRepository.findAllCompanions();
  }

  async getCompanionsByPrimaryId(primaryGuestId: string): Promise<GuestEntity[]> {
    // Verify primary guest exists
    const primaryGuest = await this.guestRepository.findById(primaryGuestId);
    if (!primaryGuest) {
      throw new Error('Primary guest not found');
    }

    if (!primaryGuest.isPrimaryGuest()) {
      throw new Error('Guest is not a primary guest');
    }

    return this.guestRepository.findCompanions(primaryGuestId);
  }
}