const { isDBConnected } = require('../config/database');
const { logger } = require('./logger');

/**
 * Middleware to check database connection before processing requests
 * Use this for routes that require database access
 */
const requireDB = (req, res, next) => {
  if (!isDBConnected()) {
    logger.warn(`Database not connected for ${req.method} ${req.path}`);
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.',
      code: 'DB_UNAVAILABLE'
    });
  }
  next();
};

/**
 * Middleware that allows requests to proceed even if database is not connected
 * Use this for routes that can work with fallback data
 */
const optionalDB = (req, res, next) => {
  req.dbAvailable = isDBConnected();
  if (!req.dbAvailable) {
    logger.warn(`Database not connected for ${req.method} ${req.path} - proceeding with fallback`);
  }
  next();
};

/**
 * Middleware to add database status to response headers
 */
const addDBStatus = (req, res, next) => {
  res.set('X-DB-Status', isDBConnected() ? 'connected' : 'disconnected');
  next();
};

module.exports = {
  requireDB,
  optionalDB,
  addDBStatus
};