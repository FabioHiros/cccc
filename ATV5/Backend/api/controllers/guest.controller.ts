import { Request, Response, RequestHandler } from 'express';
import { GuestBusinessLogic } from '../../core/business/guest.business';
import database from '../../database/connection';

export class GuestManagementController {
  private guestLogic: GuestBusinessLogic;

  constructor() {
    this.guestLogic = new GuestBusinessLogic(database);
    
    // Bind methods to preserve context
    this.retrieveAll = this.retrieveAll.bind(this);
    this.retrieveById = this.retrieveById.bind(this);
    this.retrieveAllPrimary = this.retrieveAllPrimary.bind(this);
    this.retrieveAllCompanions = this.retrieveAllCompanions.bind(this);
    this.retrieveCompanionsByPrimary = this.retrieveCompanionsByPrimary.bind(this);
    this.registerPrimary = this.registerPrimary.bind(this);
    this.registerCompanion = this.registerCompanion.bind(this);
    this.modify = this.modify.bind(this);
    this.modifyAddress = this.modifyAddress.bind(this);
    this.attachDocument = this.attachDocument.bind(this);
    this.attachContact = this.attachContact.bind(this);
    this.remove = this.remove.bind(this);
  }

  retrieveAll: RequestHandler = async (req, res) => {
    try {
      const guests = await this.guestLogic.retrieveAllGuests();
      res.status(200).json({
        success: true,
        data: guests,
        count: guests.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve guests', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  retrieveById: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const guest = await this.guestLogic.retrieveGuestById(id);

      if (!guest) {
        res.status(404).json({ 
          success: false,
          message: 'Guest not found' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: guest
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve guest', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  retrieveAllPrimary: RequestHandler = async (req, res) => {
    try {
      const primaryGuests = await this.guestLogic.retrieveAllPrimaryGuests();
      res.status(200).json({
        success: true,
        data: primaryGuests,
        count: primaryGuests.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve primary guests', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  retrieveAllCompanions: RequestHandler = async (req, res) => {
    try {
      const companions = await this.guestLogic.retrieveAllCompanions();
      res.status(200).json({
        success: true,
        data: companions,
        count: companions.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve companions', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  retrieveCompanionsByPrimary: RequestHandler = async (req, res) => {
    try {
      const { primaryId } = req.params;
      const companions = await this.guestLogic.retrieveCompanionsByPrimaryId(primaryId);
      res.status(200).json({
        success: true,
        data: companions,
        count: companions.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve companions for primary guest', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  registerPrimary: RequestHandler = async (req, res) => {
    try {
      const { fullName, displayName, birthDate, address, contact, document } = req.body;
      
      const guest = await this.guestLogic.registerPrimaryGuest({
        fullName,
        displayName,
        birthDate: new Date(birthDate),
        address,
        contact,
        document: {
          ...document,
          issuedDate: new Date(document.issuedDate)
        }
      });

      res.status(201).json({
        success: true,
        data: guest,
        message: 'Primary guest registered successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to register primary guest', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  registerCompanion: RequestHandler = async (req, res) => {
    try {
      const { primaryId } = req.params;
      const { fullName, displayName, birthDate, document } = req.body;
      
      const companion = await this.guestLogic.registerCompanion(primaryId, {
        fullName,
        displayName,
        birthDate: new Date(birthDate),
        document: {
          ...document,
          issuedDate: new Date(document.issuedDate)
        }
      });

      res.status(201).json({
        success: true,
        data: companion,
        message: 'Companion registered successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to register companion', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  modify: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, displayName, birthDate } = req.body;
      
      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (displayName) updateData.displayName = displayName;
      if (birthDate) updateData.birthDate = new Date(birthDate);
      
      const guest = await this.guestLogic.modifyGuest(id, updateData);
      res.status(200).json({
        success: true,
        data: guest,
        message: 'Guest updated successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to update guest', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  modifyAddress: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { street, district, city, region, country, postalCode } = req.body;
      
      const address = await this.guestLogic.modifyGuestAddress(id, {
        street,
        district,
        city,
        region,
        country,
        postalCode
      });

      res.status(200).json({
        success: true,
        data: address,
        message: 'Guest address updated successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to update guest address', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  attachDocument: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { category, identifier, issuedDate } = req.body;
      
      const document = await this.guestLogic.attachDocumentToGuest(id, {
        category,
        identifier,
        issuedDate: new Date(issuedDate)
      });

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document attached successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to attach document to guest', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  attachContact: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { areaCode, number } = req.body;
      
      const contact = await this.guestLogic.attachContactToGuest(id, {
        areaCode,
        number
      });

      res.status(201).json({
        success: true,
        data: contact,
        message: 'Contact attached successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to attach contact to guest', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  remove: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      await this.guestLogic.removeGuest(id);
      res.status(204).json({
        success: true,
        message: 'Guest removed successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to remove guest', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export default new GuestManagementController();