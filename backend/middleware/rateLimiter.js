const rateLimit = require('express-rate-limit');

// General rate limiter - more lenient for development
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 100, // More requests in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lenient rate limiter for read-only operations
const readOnlyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 200, // High limit for read operations
  message: {
    success: false,
    message: 'Too many read requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased to 50 login requests per windowMs for development
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

// Contact form rate limiter
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 contact form submissions per hour
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again later.'
  },
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 file uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.'
  },
});

module.exports = {
  generalLimiter,
  readOnlyLimiter,
  authLimiter,
  contactLimiter,
  uploadLimiter
};
