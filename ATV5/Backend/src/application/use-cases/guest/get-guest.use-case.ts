// src/application/use-cases/guest/get-guest.use-case.ts
import { IGuestRepository } from '../../../core/interfaces/repositories/guest.repository.interface';
import { GuestEntity } from '../../../core/entities/guest.entity';

export class GetGuestUseCase {
  constructor(private readonly guestRepository: IGuestRepository) {}

  async execute(id: string): Promise<GuestEntity> {
    const guest = await this.guestRepository.findById(id);
    
    if (!guest) {
      throw new Error('Guest not found');
    }

    return guest;
  }
}