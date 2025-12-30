const express = require('express');
const { body } = require('express-validator');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  reorderServices
} = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation rules for service creation/update
const serviceValidation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .trim(),
  body('description')
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters')
    .trim(),
  body('price')
    .isLength({ min: 1 })
    .withMessage('Price is required')
    .trim(),
  body('features')
    .optional()
    .customSanitizer(value => Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : [])),
  body('category')
    .optional()
    .isIn(['development', 'design', 'consulting', 'security', 'optimization', 'other'])
    .withMessage('Invalid category'),
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Icon name must be 50 characters or less')
    .trim(),
  body('gradient')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Gradient must be 100 characters or less')
    .trim(),
  body('duration')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Duration must be 50 characters or less')
    .trim(),
  body('tags')
    .optional()
    .customSanitizer(value => Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : [])),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('popular')
    .optional()
    .isBoolean()
    .withMessage('Popular must be a boolean'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean')
];

// Public routes
router.route('/')
  .get(getServices)
  .post(auth, upload.array('images', 5), upload.logSuccess, serviceValidation, createService);

router.route('/:id')
  .get(getService)
  .put(auth, upload.array('images', 5), upload.logSuccess, serviceValidation, updateService)
  .delete(auth, deleteService);

// Admin-only routes
router.patch('/:id/toggle', auth, toggleServiceStatus);
router.post('/reorder', auth, reorderServices);

// Upload error handler
router.use(upload.handleError);

module.exports = router;
