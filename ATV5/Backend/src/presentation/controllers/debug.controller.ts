// src/presentation/controllers/debug.controller.ts - TEMPORARY DEBUG CONTROLLER
import { Request, Response, NextFunction } from 'express';
import DatabaseConnection from '../../infrastructure/database/connection';

export class DebugController {
  
  async checkDatabase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const prisma = DatabaseConnection.getInstance();
      
      // Check all guests
      const guests = await prisma.guest.findMany({
        include: {
          documents: true,
          contacts: true,
          address: true
        }
      });
      
      // Check all documents
      const documents = await prisma.documentation.findMany();
      
      // Check all contacts
      const contacts = await prisma.contactInfo.findMany();
      
      // Check database constraints
      const tableInfo = await prisma.$queryRaw`
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          IS_NULLABLE,
          COLUMN_KEY,
          COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME, ORDINAL_POSITION
      `;
      
      res.status(200).json({
        success: true,
        message: 'Database debug information',
        data: {
          guestCount: guests.length,
          documentCount: documents.length,
          contactCount: contacts.length,
          guests: guests,
          documents: documents,
          contacts: contacts,
          tableInfo: tableInfo
        }
      });
    } catch (error) {
      console.error('Debug check failed:', error);
      next(error);
    }
  }
  
  async clearDatabase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const prisma = DatabaseConnection.getInstance();
      
      // Delete all data in order (due to foreign key constraints)
      await prisma.contactInfo.deleteMany();
      await prisma.documentation.deleteMany();
      await prisma.guest.deleteMany();
      await prisma.address.deleteMany();
      
      res.status(200).json({
        success: true,
        message: 'Database cleared successfully'
      });
    } catch (error) {
      console.error('Database clear failed:', error);
      next(error);
    }
  }
}