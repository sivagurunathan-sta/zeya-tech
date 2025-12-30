const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusText[dbStatus] || 'unknown',
      connected: dbStatus === 1
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

module.exports = router;
