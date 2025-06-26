import { Request, Response } from 'express';
import { RoomManagementLogic } from '../../core/business/room.business';
import database from '../../database/connection';

export class RoomManagementController {
  private roomLogic: RoomManagementLogic;

  constructor() {
    this.roomLogic = new RoomManagementLogic(database);
    
    this.retrieveAll = this.retrieveAll.bind(this);
    this.retrieveById = this.retrieveById.bind(this);
    this.generateStandard = this.generateStandard.bind(this);
    this.generateCustom = this.generateCustom.bind(this);
    this.modify = this.modify.bind(this);
    this.remove = this.remove.bind(this);
  }

  async retrieveAll(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await this.roomLogic.retrieveAllRooms();
      res.status(200).json({
        success: true,
        data: rooms,
        count: rooms.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve rooms', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async retrieveById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const room = await this.roomLogic.retrieveRoomById(id);

      if (!room) {
        res.status(404).json({ 
          success: false,
          message: 'Room not found' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve room', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async generateStandard(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await this.roomLogic.generateStandardRooms();
      res.status(201).json({
        success: true,
        data: rooms,
        message: 'Standard rooms generated successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to generate standard rooms', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async generateCustom(req: Request, res: Response): Promise<void> {
    try {
      const { designation, singleBeds, doubleBeds, bathrooms, hasAirControl, parkingSpaces } = req.body;
      
      const room = await this.roomLogic.generateCustomRoom({
        designation,
        singleBeds,
        doubleBeds,
        bathrooms,
        hasAirControl,
        parkingSpaces
      });

      res.status(201).json({
        success: true,
        data: room,
        message: 'Custom room generated successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to generate custom room', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async modify(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { designation, singleBeds, doubleBeds, bathrooms, hasAirControl, parkingSpaces } = req.body;
      
      const room = await this.roomLogic.modifyRoom(id, {
        designation,
        singleBeds,
        doubleBeds,
        bathrooms,
        hasAirControl,
        parkingSpaces
      });

      res.status(200).json({
        success: true,
        data: room,
        message: 'Room updated successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to update room', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.roomLogic.removeRoom(id);
      res.status(204).json({
        success: true,
        message: 'Room removed successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to remove room', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new RoomManagementController();