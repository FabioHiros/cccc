// src/presentation/controllers/health.controller.ts
import { Request, Response, NextFunction } from 'express';
import DatabaseConnection from '../../infrastructure/database/connection';

export class HealthController {
  async checkHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const uptime = process.uptime();
      
      // Check database connection
      const databaseStatus = await DatabaseConnection.healthCheck();
      
      const healthData = {
        status: databaseStatus ? 'healthy' : 'unhealthy',
        timestamp,
        uptime: `${Math.floor(uptime)} seconds`,
        service: 'Hotel Management API - Atlantis Elite Edition',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: databaseStatus ? 'connected' : 'disconnected',
          type: 'MySQL with Prisma ORM'
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
      };

      const statusCode = databaseStatus ? 200 : 503;
      
      res.status(statusCode).json({
        success: databaseStatus,
        message: databaseStatus ? 'Service is healthy' : 'Service is unhealthy',
        data: healthData
      });
    } catch (error) {
      next(error);
    }
  }

  async checkReadiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if all required services are ready
      const databaseReady = await DatabaseConnection.healthCheck();
      
      const isReady = databaseReady;
      
      res.status(isReady ? 200 : 503).json({
        success: isReady,
        message: isReady ? 'Service is ready' : 'Service is not ready',
        data: {
          database: databaseReady,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async checkLiveness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Simple liveness check - if we can respond, we're alive
      res.status(200).json({
        success: true,
        message: 'Service is alive',
        data: {
          timestamp: new Date().toISOString(),
          uptime: `${Math.floor(process.uptime())} seconds`
        }
      });
    } catch (error) {
      next(error);
    }
  }
}