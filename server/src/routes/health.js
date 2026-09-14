import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

const getReadyStateLabel = (state) => {
  switch (state) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
};

router.get('/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const isConnected = readyState === 1;

  const healthData = {
    status: isConnected ? 'ok' : 'degraded',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: {
      status: getReadyStateLabel(readyState),
      readyState,
      name: isConnected ? mongoose.connection.name : null,
      host: isConnected ? mongoose.connection.host : null,
    },
    server: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    },
  };

  if (!isConnected) {
    return res.status(503).json({
      ...healthData,
      message: 'Database is not connected',
    });
  }

  return res.status(200).json({
    ...healthData,
    message: 'Server and Database are healthy',
  });
});

export default router;
