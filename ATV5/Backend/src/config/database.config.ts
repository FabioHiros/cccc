// src/config/database.config.ts
import { PrismaClient } from '@prisma/client';
import { config } from './app.config';

class DatabaseConfig {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new PrismaClient({
        log: config.NODE_ENV === 'development' 
          ? ['query', 'info', 'warn', 'error'] 
          : ['error'],
        errorFormat: 'pretty',
      });
    }
    return DatabaseConfig.instance;
  }

  public static async connect(): Promise<void> {
    try {
      await DatabaseConfig.getInstance().$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    await DatabaseConfig.getInstance().$disconnect();
    console.log('🔒 Database disconnected gracefully');
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      await DatabaseConfig.getInstance().$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export default DatabaseConfig;