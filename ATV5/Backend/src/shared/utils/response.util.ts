// src/shared/utils/response.util.ts
import { Response } from 'express';
import { ApiResponse, PaginatedApiResponse } from '../types/api-response.type';
import { PaginationInfo } from '../types/pagination.type';

export class ResponseUtil {
  /**
   * Send a successful response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send a successful response with pagination
   */
  static successWithPagination<T>(
    res: Response,
    data: T[],
    pagination: PaginationInfo,
    message: string = 'Data retrieved successfully',
    statusCode: number = 200
  ): Response<PaginatedApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 500,
    details?: any
  ): Response<ApiResponse<null>> {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      error: details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send a not found response
   */
  static notFound(
    res: Response,
    resource: string = 'Resource',
    resourceId?: string
  ): Response<ApiResponse<null>> {
    const message = resourceId 
      ? `${resource} with ID '${resourceId}' not found`
      : `${resource} not found`;
    
    return ResponseUtil.error(res, message, 404);
  }

  /**
   * Send a bad request response
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request',
    validationErrors?: any
  ): Response<ApiResponse<null>> {
    return ResponseUtil.error(res, message, 400, validationErrors);
  }

  /**
   * Send an unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response<ApiResponse<null>> {
    return ResponseUtil.error(res, message, 401);
  }

  /**
   * Send a forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response<ApiResponse<null>> {
    return ResponseUtil.error(res, message, 403);
  }

  /**
   * Send a conflict response
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict',
    details?: any
  ): Response<ApiResponse<null>> {
    return ResponseUtil.error(res, message, 409, details);
  }

  /**
   * Send an internal server error response
   */
  static internalServerError(
    res: Response,
    message: string = 'Internal server error',
    details?: any
  ): Response<ApiResponse<null>> {
    return ResponseUtil.error(res, message, 500, details);
  }

  /**
   * Send a created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response<ApiResponse<T>> {
    return ResponseUtil.success(res, data, message, 201);
  }

  /**
   * Send a no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a validation error response
   */
  static validationError(
    res: Response,
    errors: Record<string, string[]> | string[],
    message: string = 'Validation failed'
  ): Response<ApiResponse<null>> {
    return ResponseUtil.badRequest(res, message, { validationErrors: errors });
  }

  /**
   * Send a health check response
   */
  static health(
    res: Response,
    status: 'healthy' | 'unhealthy',
    checks: Record<string, boolean>,
    metadata?: any
  ): Response {
    const statusCode = status === 'healthy' ? 200 : 503;
    
    return res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      checks,
      ...metadata,
    });
  }
}