// src/main.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { routes } from './presentation/routes';
import { ErrorHandlerMiddleware } from './presentation/middleware/error-handler.middleware';
import { LoggerMiddleware } from './presentation/middleware/logger.middleware';
import DatabaseConnection from './infrastructure/database/connection';

// Load environment variables
dotenv.config();

class Application {
  private app: express.Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(LoggerMiddleware.log);
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // 404 handler for undefined routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        error: {
          code: 'ROUTE_NOT_FOUND',
          timestamp: new Date().toISOString()
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(ErrorHandlerMiddleware.handle);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseConnection.connect();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`🚀 Server is running on port ${this.port}`);
        console.log(`🏨 Welcome to the Premier Hotel & Resort Management System - Atlantis Elite Edition`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📡 API Base URL: http://localhost:${this.port}/api`);
        console.log(`💊 Health Check: http://localhost:${this.port}/api/health`);
        console.log(`📖 API Documentation: http://localhost:${this.port}/api/v1`);
      });

      // Graceful shutdown handlers
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
      
      try {
        await DatabaseConnection.disconnect();
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }
}

// Start application
const app = new Application();
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});