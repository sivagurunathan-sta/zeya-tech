const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple file logger
const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] INFO: ${message} ${JSON.stringify(meta)}\n`;
    console.log(`ℹ️  ${message}`, meta);
    
    if (process.env.LOG_FILE) {
      fs.appendFileSync(path.join(__dirname, '..', process.env.LOG_FILE), logEntry);
    }
  },

  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message} ${JSON.stringify(error)}\n`;
    console.error(`❌ ${message}`, error);
    
    if (process.env.LOG_FILE) {
      fs.appendFileSync(path.join(__dirname, '..', process.env.LOG_FILE), logEntry);
    }
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] WARN: ${message} ${JSON.stringify(meta)}\n`;
    console.warn(`⚠️  ${message}`, meta);
    
    if (process.env.LOG_FILE) {
      fs.appendFileSync(path.join(__dirname, '..', process.env.LOG_FILE), logEntry);
    }
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] DEBUG: ${message} ${JSON.stringify(meta)}\n`;
      console.debug(`🐛 ${message}`, meta);
      
      if (process.env.LOG_FILE) {
        fs.appendFileSync(path.join(__dirname, '..', process.env.LOG_FILE), logEntry);
      }
    }
  }
};

// HTTP request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    
    const message = `${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${ip}`;
    
    if (statusCode >= 400) {
      logger.error(message);
    } else {
      logger.info(message);
    }
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger
};