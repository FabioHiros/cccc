import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './api/routes';
import { DatabaseManager } from './database/connection';

dotenv.config();

const application = express();
const SERVER_PORT = process.env.PORT || 3000;

// Middleware configuration
application.use(express.json());
application.use(cors());

// API routes
application.use('/api', apiRoutes);

// Health check endpoint
application.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'operational',
    timestamp: new Date().toISOString(),
    service: 'Hotel Management API'
  });
});

// Server initialization
application.listen(SERVER_PORT, async () => {
  console.log(`🚀 Server is running on port ${SERVER_PORT}`);
  console.log(`🏨 Welcome to the Premier Hotel & Resort Management System - Atlantis Elite Edition`);
  
  await DatabaseManager.initialize();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await DatabaseManager.terminate();
  console.log('🛑 Server shutdown completed');
  process.exit(0);
});