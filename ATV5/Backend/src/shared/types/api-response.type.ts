// src/shared/types/api-response.type.ts
import { PaginationInfo } from './pagination.type';

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: any;
  timestamp: string;
}

/**
 * Paginated API response structure
 */
export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationInfo;
  error?: any;
  timestamp: string;
}

/**
 * Health check response structure
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: string;
  service: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'connected' | 'disconnected';
      type: string;
    };
    memory: {
      used: string;
      total: string;
    };
  };
}

/**
 * Error response structure for consistent error handling
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    code?: string;
    details?: any;
    stack?: string;
  };
  timestamp: string;
}

/**
 * Success response structure for operations that don't return data
 */
export interface SuccessResponse {
  success: true;
  message: string;
  timestamp: string;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validation error response structure
 */
export interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    details: {
      validationErrors: ValidationError[];
    };
  };
}