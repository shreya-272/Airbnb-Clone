import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import healthRoutes from './routes/health.js';
import listingRoutes from '../routes/listingRoutes.js';
import favoriteRoutes from '../routes/favoriteRoutes.js';

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

// Middleware: JSON Body Parser
app.use(express.json());

// Request logging middleware (dev)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api', listingRoutes);
app.use('/api', favoriteRoutes);

// Root fallback route
app.get('/', (req, res) => {
  res.json({
    name: 'Airbnb Clone API Server',
    status: 'online',
    healthCheck: '/api/health',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Airbnb Server listening on http://localhost:${PORT}`);
  console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
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
