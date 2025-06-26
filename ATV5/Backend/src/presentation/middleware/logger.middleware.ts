// src/presentation/middleware/logger.middleware.ts
import { Request, Response, NextFunction } from 'express';

export class LoggerMiddleware {
  static log(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Log incoming request
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk?: any) {
      const duration = Date.now() - startTime;
      const responseTimestamp = new Date().toISOString();
      
      console.log(
        `[${responseTimestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
      );
      
      // Call original end method
      originalEnd.call(this, chunk);
    };

    next();
  }
}