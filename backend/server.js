const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/database');
const { logger, requestLogger } = require('./middleware/logger');
const securityMiddleware = require('./middleware/security');
const { generalLimiter, readOnlyLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

// Optional override to relax all restrictions (use for debugging or specific hosting constraints)
const ALLOW_ALL = process.env.ALLOW_ALL === 'true';

// Trust proxy for accurate IP addresses (if behind reverse proxy)
app.set('trust proxy', 1);

// Request logging
app.use(requestLogger);

// Security middleware
if (ALLOW_ALL) {
  console.log('Security middleware disabled via ALLOW_ALL');
} else {
  app.use(securityMiddleware);
}

// CORS Configuration
if (ALLOW_ALL) {
  app.use(cors({
    origin: true, // reflect request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));
  console.log('CORS: allowing all origins via ALLOW_ALL');
} else {
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5001',
      'https://zeyasolutions.com',
      'http://zeyasolutions.com',
      'https://www.zeyasolutions.com',
      'http://www.zeyasolutions.com',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));
}

// Rate limiting (method-based) with health whitelisting
if (!ALLOW_ALL) {
  const skipRateLimitPaths = new Set(['/health', '/api/health']);
  app.use((req, res, next) => {
    if (skipRateLimitPaths.has(req.path)) return next();
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return readOnlyLimiter(req, res, next);
    }
    return generalLimiter(req, res, next);
  });
} else {
  console.log('Rate limiting disabled via ALLOW_ALL');
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('Created uploads directory');
}

// Create subdirectories for different types of uploads
const subdirs = ['images', 'documents', 'avatars'];
subdirs.forEach(dir => {
  const fullPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    logger.info(`Created uploads/${dir} directory`);
    console.log(`✅ Created upload directory: ${fullPath}`);
  }
});

// Static files - Enhanced with better headers
app.use('/uploads', (req, res, next) => {
  // Set proper headers for static files
  res.set({
    'Cache-Control': 'public, max-age=31536000', // 1 year cache
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
  next();
}, express.static(uploadsDir, {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// API routes
app.use('/api', apiRoutes);

// Basic route for development
app.get('/', (req, res) => {
  res.json({
    message: 'ZEYA-TECH Website API is running',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      uploads: '/uploads'
    }
  });
});

// Health check route - Enhanced
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  // Check if uploads directory exists
  const uploadsExists = fs.existsSync(uploadsDir);
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusText[dbStatus] || 'unknown',
      connected: dbStatus === 1
    },
    uploads: {
      directory: uploadsDir,
      exists: uploadsExists,
      accessible: uploadsExists && fs.access ? true : false
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API health check specifically
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Test image endpoint for debugging
app.get('/api/test-upload', (req, res) => {
  const testImagePath = path.join(uploadsDir, 'test.jpg');
  const imageExists = fs.existsSync(testImagePath);
  
  res.json({
    message: 'Upload test endpoint',
    uploadsDir,
    testImageExists: imageExists,
    testImagePath: imageExists ? '/uploads/test.jpg' : null,
    availableImages: fs.existsSync(uploadsDir) ? 
      fs.readdirSync(uploadsDir, { withFileTypes: true })
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name)
        .filter(name => /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
      : []
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requestedPath: req.path
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
let server;

// Start server function that ensures database connection first
const startServer = async () => {
  try {
    logger.info('Starting server...');
    
    // Connect to MongoDB first
    await connectDB();

    // Initialize default data
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const Service = require('./models/Service');
        if (Service.createDefaults) {
          await Service.createDefaults();
        }
        const Achievement = require('./models/Achievement');
        if (Achievement.createDefaults) {
          await Achievement.createDefaults();
        }
        logger.info('Default data initialized');
      }
    } catch (error) {
      logger.error('Error initializing defaults:', error);
    }

    // Only start the server after database connection is established
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 API endpoints: http://localhost:${PORT}/api`);
      console.log(`📁 Static files: http://localhost:${PORT}/uploads`);
      console.log(`🖼️ Upload test: http://localhost:${PORT}/api/test-upload`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('❌ Server startup failed. Please check the logs above.');
    
    // Try to start server without database in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Starting server without database connection for development...');
      server = app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Server running in development mode on port ${PORT} (without database)`);
        console.log(`🚀 Server is running on http://localhost:${PORT} (Database disconnected)`);
        console.log(`📁 Static files: http://localhost:${PORT}/uploads`);
      });
    } else {
      process.exit(1);
    }
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  console.error('❌ Unhandled Promise Rejection:', err.message);
  
  // Close server & exit process
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }
  
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
  
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
