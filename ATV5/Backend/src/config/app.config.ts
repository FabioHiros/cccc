// src/config/app.config.ts
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/hotel_db',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Application Configuration
  API_PREFIX: '/api',
  API_VERSION: '/v1',
  
  // Helper methods
  isDevelopment: (): boolean => config.NODE_ENV === 'development',
  isProduction: (): boolean => config.NODE_ENV === 'production',
  isTest: (): boolean => config.NODE_ENV === 'test',
  
  // Get full API path
  getApiPath: (endpoint: string = ''): string => {
    return `${config.API_PREFIX}${config.API_VERSION}${endpoint}`;
  }
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;