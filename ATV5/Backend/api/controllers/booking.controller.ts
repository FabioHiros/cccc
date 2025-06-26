import { Request, Response, RequestHandler } from 'express';
import { BookingManagementLogic } from '../../core/business/booking.business';
import database from '../../database/connection';

export class BookingManagementController {
  private bookingLogic: BookingManagementLogic;

  constructor() {
    this.bookingLogic = new BookingManagementLogic(database);
    
    this.retrieveAll = this.retrieveAll.bind(this);
    this.retrieveById = this.retrieveById.bind(this);
    this.retrieveByPrimaryId = this.retrieveByPrimaryId.bind(this);
    this.create = this.create.bind(this);
    this.modify = this.modify.bind(this);
    this.remove = this.remove.bind(this);
  }

  retrieveAll: RequestHandler = async (req, res) => {
    try {
      const bookings = await this.bookingLogic.retrieveAllBookings();
      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve bookings', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  retrieveById: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const booking = await this.bookingLogic.retrieveBookingById(id);

      if (!booking) {
        res.status(404).json({ 
          success: false,
          message: 'Booking not found' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve booking', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  retrieveByPrimaryId: RequestHandler = async (req, res) => {
    try {
      const { primaryId } = req.params;
      const bookings = await this.bookingLogic.retrieveBookingsByPrimaryId(primaryId);
      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve bookings for primary guest', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  create: RequestHandler = async (req, res) => {
    try {
      const { primaryId, roomId, arrivalDate, departDate } = req.body;
      
      const booking = await this.bookingLogic.createBooking({
        primaryId,
        roomId,
        arrivalDate: new Date(arrivalDate),
        departDate: new Date(departDate)
      });

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to create booking', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  modify: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { roomId, arrivalDate, departDate } = req.body;
      
      const updateData: any = {};
      if (roomId) updateData.roomId = roomId;
      if (arrivalDate) updateData.arrivalDate = new Date(arrivalDate);
      if (departDate) updateData.departDate = new Date(departDate);
      
      const booking = await this.bookingLogic.modifyBooking(id, updateData);
      res.status(200).json({
        success: true,
        data: booking,
        message: 'Booking updated successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to update booking', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  remove: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      await this.bookingLogic.removeBooking(id);
      res.status(204).json({
        success: true,
        message: 'Booking removed successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to remove booking', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export default new BookingManagementController();