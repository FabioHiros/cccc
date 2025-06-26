// src/presentation/middleware/error-handler.middleware.ts
import { Request, Response, NextFunction } from 'express';

export class ErrorHandlerMiddleware {
  static handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Error occurred:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Handle known application errors
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        message: error.message,
        error: {
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      res.status(409).json({
        success: false,
        message: error.message,
        error: {
          code: 'CONFLICT',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    if (error.message.includes('invalid') || error.message.includes('required')) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: {
          code: 'BAD_REQUEST',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as any;
      switch (prismaError.code) {
        case 'P2002':
          res.status(409).json({
            success: false,
            message: 'Resource already exists',
            error: {
              code: 'CONFLICT',
              timestamp: new Date().toISOString()
            }
          });
          return;
        case 'P2025':
          res.status(404).json({
            success: false,
            message: 'Resource not found',
            error: {
              code: 'NOT_FOUND',
              timestamp: new Date().toISOString()
            }
          });
          return;
        default:
          res.status(500).json({
            success: false,
            message: 'Database error occurred',
            error: {
              code: 'DATABASE_ERROR',
              timestamp: new Date().toISOString()
            }
          });
          return;
      }
    }

    // Default error response
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      error: {
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
      }
    });
  }
}