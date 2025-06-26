// src/shared/exceptions/business.exception.ts
import { BaseException } from './base.exception';

export class BusinessException extends BaseException {
  constructor(
    message: string,
    context?: string,
    metadata?: any,
    statusCode: number = 422 // Unprocessable Entity
  ) {
    super(message, statusCode, context, metadata);
  }

  /**
   * Create a BusinessException for invalid date range
   */
  static invalidDateRange(checkIn: Date, checkOut: Date): BusinessException {
    return new BusinessException(
      'Check-out date must be after check-in date',
      'BOOKING_VALIDATION',
      { checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString() }
    );
  }

  /**
   * Create a BusinessException for past date booking
   */
  static pastDateBooking(date: Date): BusinessException {
    return new BusinessException(
      'Cannot create booking for past dates',
      'BOOKING_VALIDATION',
      { attemptedDate: date.toISOString(), currentDate: new Date().toISOString() }
    );
  }

  /**
   * Create a BusinessException for room unavailability
   */
  static roomUnavailable(roomId: string, checkIn: Date, checkOut: Date): BusinessException {
    return new BusinessException(
      'Room is not available for the selected dates',
      'BOOKING_AVAILABILITY',
      { 
        roomId, 
        checkIn: checkIn.toISOString(), 
        checkOut: checkOut.toISOString() 
      }
    );
  }

  /**
   * Create a BusinessException for companion cannot make reservation
   */
  static companionCannotMakeReservation(guestId: string): BusinessException {
    return new BusinessException(
      'Companions cannot make reservations. Only primary guests can create bookings',
      'BOOKING_AUTHORIZATION',
      { guestId, guestType: 'companion' }
    );
  }

  /**
   * Create a BusinessException for invalid guest relationship
   */
  static invalidGuestRelationship(guestId: string, primaryGuestId: string): BusinessException {
    return new BusinessException(
      'Guest is not a companion of the specified primary guest',
      'GUEST_RELATIONSHIP',
      { guestId, primaryGuestId }
    );
  }

  /**
   * Create a BusinessException for duplicate resource
   */
  static duplicateResource(resource: string, field: string, value: string): BusinessException {
    return new BusinessException(
      `${resource} with ${field} '${value}' already exists`,
      'DUPLICATE_RESOURCE',
      { resource, field, value },
      409 // Conflict
    );
  }

  /**
   * Create a BusinessException for invalid document
   */
  static invalidDocument(documentType: string, identifier: string, reason: string): BusinessException {
    return new BusinessException(
      `Invalid ${documentType}: ${reason}`,
      'DOCUMENT_VALIDATION',
      { documentType, identifier, reason }
    );
  }

  /**
   * Create a BusinessException for inactive resource
   */
  static inactiveResource(resource: string, resourceId: string): BusinessException {
    return new BusinessException(
      `${resource} is inactive and cannot be used`,
      'RESOURCE_STATUS',
      { resource, resourceId, status: 'inactive' }
    );
  }

  /**
   * Create a BusinessException for exceeded capacity
   */
  static exceededCapacity(resource: string, maxCapacity: number, requested: number): BusinessException {
    return new BusinessException(
      `${resource} capacity exceeded. Maximum: ${maxCapacity}, Requested: ${requested}`,
      'CAPACITY_VALIDATION',
      { resource, maxCapacity, requested }
    );
  }

  /**
   * Create a BusinessException for invalid status transition
   */
  static invalidStatusTransition(
    resource: string, 
    currentStatus: string, 
    targetStatus: string
  ): BusinessException {
    return new BusinessException(
      `Cannot change ${resource} status from '${currentStatus}' to '${targetStatus}'`,
      'STATUS_TRANSITION',
      { resource, currentStatus, targetStatus }
    );
  }

  /**
   * Create a BusinessException for missing required data
   */
  static missingRequiredData(resource: string, requiredFields: string[]): BusinessException {
    return new BusinessException(
      `Missing required data for ${resource}: ${requiredFields.join(', ')}`,
      'REQUIRED_DATA',
      { resource, requiredFields }
    );
  }

  /**
   * Create a BusinessException for operation not allowed
   */
  static operationNotAllowed(operation: string, reason: string): BusinessException {
    return new BusinessException(
      `Operation '${operation}' not allowed: ${reason}`,
      'OPERATION_NOT_ALLOWED',
      { operation, reason }
    );
  }
}