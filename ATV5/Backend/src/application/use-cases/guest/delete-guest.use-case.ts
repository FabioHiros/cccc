// src/application/use-cases/guest/delete-guest.use-case.ts - HANDLE RESERVATIONS
import { IGuestRepository } from '../../../core/interfaces/repositories/guest.repository.interface';
import { IBookingRepository } from '../../../core/interfaces/repositories/booking.repository.interface';

export class DeleteGuestUseCase {
  constructor(
    private readonly guestRepository: IGuestRepository,
    private readonly bookingRepository?: IBookingRepository // Optional for backward compatibility
  ) {}

  async execute(id: string): Promise<void> {
    // Check if guest exists
    const guest = await this.guestRepository.findById(id);
    if (!guest) {
      throw new Error('Guest not found');
    }

    console.log(`🗑️ Attempting to delete guest: ${guest.fullName} (ID: ${id})`);

    // Check for active reservations if booking repository is available
    if (this.bookingRepository) {
      try {
        const reservations = await this.bookingRepository.findByPrimaryGuestId(id);
        
        if (reservations && reservations.length > 0) {
          console.log(`📋 Guest has ${reservations.length} reservation(s)`);
          
          // Check if any reservations are active or upcoming using string comparison (same logic as UI)
          const today = new Date();
          const todayStr = today.getFullYear() + '-' + 
                         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(today.getDate()).padStart(2, '0');
          
          const activeOrUpcomingReservations = reservations.filter(reservation => {
            try {
              // Use same logic as frontend for consistency
              const arrivalDateStr = reservation.arrivalDate.toISOString().split('T')[0];
              const departDateStr = reservation.departDate.toISOString().split('T')[0];
              
              console.log(`🔍 Checking reservation ${reservation.id}:`, {
                arrivalDate: arrivalDateStr,
                departDate: departDateStr,
                today: todayStr,
                isActiveOrUpcoming: departDateStr >= todayStr
              });
              
              // Reservation is active/upcoming if checkout date is today or in the future
              return departDateStr >= todayStr;
            } catch (error) {
              console.warn(`⚠️ Error checking reservation ${reservation.id}:`, error);
              return true; // Conservative approach - assume it's active if we can't determine
            }
          });
          
          console.log(`📊 Found ${activeOrUpcomingReservations.length} active/upcoming reservations out of ${reservations.length} total`);
          
          if (activeOrUpcomingReservations.length > 0) {
            // List the problematic reservations for debugging
            const problemReservations = activeOrUpcomingReservations.map(r => ({
              id: r.id,
              arrival: r.arrivalDate.toISOString().split('T')[0],
              depart: r.departDate.toISOString().split('T')[0]
            }));
            
            console.log(`❌ Active/upcoming reservations preventing deletion:`, problemReservations);
            
            throw new Error(
              `Cannot delete guest with active or upcoming reservations. ` +
              `Please cancel or complete ${activeOrUpcomingReservations.length} reservation(s) first.`
            );
          }
          
          console.log(`✅ All ${reservations.length} reservations are completed - proceeding with deletion`);
        }
      } catch (error) {
        // If it's our business logic error, re-throw it
        if (error.message.includes('Cannot delete guest with active')) {
          throw error;
        }
        // If it's a technical error (like booking service down), log and continue
        console.warn('⚠️ Could not check reservations:', error.message);
        console.warn('🔄 Proceeding with deletion anyway...');
      }
    }

    // If guest is primary and has companions, they will be auto-deleted due to cascade
    if (guest.isPrimaryGuest() && guest.companions.length > 0) {
      console.log(`👥 This primary guest has ${guest.companions.length} companion(s) that will be automatically deleted`);
      console.log(`📝 Companions: ${guest.companions.map(c => c.fullName).join(', ')}`);
    }

    try {
      // Delete the guest - cascade will handle companions automatically
      await this.guestRepository.delete(id);
      console.log(`✅ Guest and all related data deleted successfully`);
    } catch (error) {
      console.error(`❌ Deletion failed:`, error);
      
      // Handle specific foreign key constraint errors
      if (error.message?.includes('Foreign key constraint') || 
          error.message?.includes('primary_id') ||
          error.code === 'P2003') {
        
        // Try to get more info about the constraint violation
        console.log(`🔍 Foreign key constraint violated - guest likely has reservations that weren't detected`);
        
        // Option 1: Try to delete reservations first (if we have booking repository)
        if (this.bookingRepository) {
          try {
            console.log(`🗑️ Attempting to delete reservations first...`);
            const reservations = await this.bookingRepository.findByPrimaryGuestId(id);
            
            console.log(`📋 Found ${reservations.length} reservations to delete`);
            
            // Delete all reservations for this guest
            for (const reservation of reservations) {
              console.log(`🗑️ Deleting reservation ${reservation.id}`);
              await this.bookingRepository.delete(reservation.id);
            }
            
            console.log(`✅ Deleted all reservations, now deleting guest...`);
            
            // Now try to delete the guest again
            await this.guestRepository.delete(id);
            
            console.log(`✅ Guest deleted successfully after removing reservations`);
            return;
            
          } catch (deleteReservationsError) {
            console.error(`❌ Could not delete reservations:`, deleteReservationsError);
          }
        }
        
        // If we get here, we couldn't resolve the constraint
        throw new Error(
          'Cannot delete guest due to existing reservations. ' +
          'Please cancel all reservations for this guest first, then try again.'
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}