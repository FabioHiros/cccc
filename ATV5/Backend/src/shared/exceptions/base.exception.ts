// src/shared/exceptions/base.exception.ts
export abstract class BaseException extends Error {
  public readonly statusCode: number;
  public readonly context?: string;
  public readonly metadata?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number,
    context?: string,
    metadata?: any
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.context = context;
    this.metadata = metadata;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert the exception to a plain object for serialization
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Get a user-friendly error message
   */
  public getUserMessage(): string {
    return this.message;
  }

  /**
   * Check if this is a client error (4xx)
   */
  public isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if this is a server error (5xx)
   */
  public isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Get the HTTP status code
   */
  public getStatusCode(): number {
    return this.statusCode;
  }

  /**
   * Get the context information
   */
  public getContext(): string | undefined {
    return this.context;
  }

  /**
   * Get the metadata
   */
  public getMetadata(): any {
    return this.metadata;
  }
}