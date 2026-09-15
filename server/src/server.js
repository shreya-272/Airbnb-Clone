import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import healthRoutes from './routes/health.js';
import listingRoutes from '../routes/listingRoutes.js';
import favoriteRoutes from '../routes/favoriteRoutes.js';
import bookingRoutes from '../routes/bookingRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import messageRoutes from '../routes/messageRoutes.js';
import notificationRoutes from '../routes/notificationRoutes.js';
import hostRoutes from '../routes/hostRoutes.js';
import { errorHandler, AppError } from '../middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to MongoDB
connectDB();

// Middleware: CORS
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Middleware: JSON & Form Body Parser (10MB limit to support device photo uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (dev)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', listingRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', bookingRoutes);
app.use('/api', messageRoutes);
app.use('/api', notificationRoutes);
app.use('/api', hostRoutes);

// Root fallback route
app.get('/', (req, res) => {
  res.json({
    name: 'Airbnb Clone API Server',
    status: 'online',
    healthCheck: '/api/health',
  });
});

// 404 Handler - Unmatched routes pass to global error handler
app.use((req, res, next) => {
  next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, 404));
});

// Global Express Error Handling Middleware
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Airbnb Server listening on http://localhost:${PORT}`);
  console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} is already in use. The backend may already be running at http://localhost:${PORT}.`);
    process.exit(0);
  }

  console.error('[Server] Failed to start:', error);
});

// Graceful Shutdown
const handleShutdown = (signal) => {
  console.log(`\n[Server] ${signal} signal received. Closing HTTP server...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default app;
