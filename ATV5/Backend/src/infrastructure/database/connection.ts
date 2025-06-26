// src/infrastructure/database/connection.ts - FIXED
import { PrismaClient } from '@prisma/client';
import { logger } from '../../shared/utils/logger.util';

class DatabaseConnection {
  private static instance: PrismaClient;
  private static isConnected: boolean = false;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
      });
    }
    return DatabaseConnection.instance;
  }

  public static async connect(): Promise<void> {
    try {
      if (DatabaseConnection.isConnected) {
        logger.info('Database already connected', 'DATABASE');
        return;
      }

      const prisma = DatabaseConnection.getInstance();
      await prisma.$connect();
      
      // Test the connection
      await prisma.$queryRaw`SELECT 1`;
      
      DatabaseConnection.isConnected = true;
      logger.info('Database connected successfully', 'DATABASE');
    } catch (error) {
      logger.error('Failed to connect to database', 'DATABASE', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      if (!DatabaseConnection.instance || !DatabaseConnection.isConnected) {
        logger.info('Database not connected', 'DATABASE');
        return;
      }

      await DatabaseConnection.instance.$disconnect();
      DatabaseConnection.isConnected = false;
      logger.info('Database disconnected successfully', 'DATABASE');
    } catch (error) {
      logger.error('Failed to disconnect from database', 'DATABASE', error);
      throw error;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      if (!DatabaseConnection.instance) {
        return false;
      }

      await DatabaseConnection.instance.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', 'DATABASE', error);
      return false;
    }
  }

  public static isReady(): boolean {
    return DatabaseConnection.isConnected;
  }
}

export default DatabaseConnection;