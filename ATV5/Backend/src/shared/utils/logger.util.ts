// src/shared/utils/logger.util.ts
import { config } from '../../config/app.config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  metadata?: any;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = this.getLogLevelFromConfig();
  }

  private getLogLevelFromConfig(): LogLevel {
    switch (config.LOG_LEVEL.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, context?: string, metadata?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    const metadataStr = metadata ? `\n${JSON.stringify(metadata, null, 2)}` : '';
    
    return `${timestamp} [${level}] ${contextStr} ${message}${metadataStr}`;
  }

  private log(level: LogLevel, levelName: string, message: string, context?: string, metadata?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, context, metadata);

    if (level === LogLevel.ERROR) {
      console.error(formattedMessage);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }

  error(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, context, metadata);
  }

  info(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, context, metadata);
  }

  debug(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context, metadata);
  }

  // Convenience methods for common use cases
  logRequest(method: string, url: string, statusCode?: number, duration?: number): void {
    const metadata = {
      method,
      url,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    };
    
    this.info(`${method} ${url}${statusCode ? ` - ${statusCode}` : ''}`, 'HTTP', metadata);
  }

  logError(error: Error, context?: string): void {
    this.error(error.message, context, {
      name: error.name,
      stack: error.stack,
    });
  }

  logDatabaseQuery(query: string, duration?: number): void {
    if (config.isDevelopment()) {
      this.debug(`Query executed in ${duration}ms`, 'DATABASE', { query });
    }
  }

  logBusinessEvent(event: string, entityId?: string, metadata?: any): void {
    this.info(event, 'BUSINESS', {
      entityId,
      ...metadata,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing or custom instances
export { Logger };