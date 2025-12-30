// backend/middleware/security.js
const helmet = require('helmet');

// Create a simple mongo sanitize function if the package is not available
const createMongoSanitize = () => {
  return (req, res, next) => {
    // Simple sanitization function
    const sanitize = (obj) => {
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'string') {
              // Remove $ and . from strings to prevent NoSQL injection
              obj[key] = obj[key].replace(/[\$\.]/g, '');
            } else if (typeof obj[key] === 'object') {
              sanitize(obj[key]);
            }
          }
        }
      }
      return obj;
    };

    // Sanitize request body, query, and params
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    
    next();
  };
};

// Create a simple XSS clean function
const createXSSClean = () => {
  return (req, res, next) => {
    const clean = (obj) => {
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'string') {
              // Basic XSS prevention
              obj[key] = obj[key]
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
            } else if (typeof obj[key] === 'object') {
              clean(obj[key]);
            }
          }
        }
      }
      return obj;
    };

    if (req.body) req.body = clean(req.body);
    if (req.query) req.query = clean(req.query);
    if (req.params) req.params = clean(req.params);
    
    next();
  };
};

// Create a simple HPP function
const createHPP = () => {
  return (req, res, next) => {
    // Simple parameter pollution prevention
    if (req.query) {
      for (let key in req.query) {
        if (Array.isArray(req.query[key])) {
          // Keep only the last value if multiple values are provided
          req.query[key] = req.query[key][req.query[key].length - 1];
        }
      }
    }
    next();
  };
};

// Try to import the packages, fall back to custom implementations
let mongoSanitize, xss, hpp;

try {
  mongoSanitize = require('express-mongo-sanitize');
} catch (error) {
  console.log('⚠️  express-mongo-sanitize not found, using fallback implementation');
  mongoSanitize = createMongoSanitize;
}

try {
  xss = require('xss-clean');
} catch (error) {
  console.log('⚠️  xss-clean not found, using fallback implementation');
  xss = createXSSClean;
}

try {
  hpp = require('hpp');
} catch (error) {
  console.log('⚠️  hpp not found, using fallback implementation');
  hpp = createHPP;
}

// Security middleware configuration
const securityMiddleware = [
  // Set various HTTP headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false
  }),

  // Data sanitization against NoSQL query injection
  typeof mongoSanitize === 'function' ? mongoSanitize() : mongoSanitize,

  // Data sanitization against XSS
  typeof xss === 'function' ? xss() : xss,

  // Prevent HTTP Parameter Pollution attacks
  typeof hpp === 'function' ? hpp({
    whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'status', 'department']
  }) : hpp()
];

module.exports = securityMiddleware;