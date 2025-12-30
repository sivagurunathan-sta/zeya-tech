const express = require('express');
const {
  submitContactForm,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
  markAsRead,
  bulkUpdateStatus,
  searchContacts
} = require('../controllers/contactController');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware for contact form
const validateContactForm = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      const cleaned = String(value).replace(/[^\d+]/g, '');
      if (!/^\+?\d{7,15}$/.test(cleaned)) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  body('queryType')
    .optional()
    .isIn(['general', 'project', 'support', 'career', 'partnership'])
    .withMessage('Invalid query type'),
  
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid urgency level'),
  
  // Custom validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Public routes
router.post('/', validateContactForm, submitContactForm);

// Protected routes (Admin only)
router.get('/', auth, getContacts);
router.get('/search', auth, searchContacts);
router.get('/stats', auth, getContactStats);
router.get('/:id', auth, getContactById);
router.put('/:id/status', auth, updateContactStatus);
router.patch('/:id/read', auth, markAsRead);
router.put('/bulk/status', auth, bulkUpdateStatus);
router.delete('/:id', auth, deleteContact);

module.exports = router;
