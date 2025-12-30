// backend/routes/achievementRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement
} = require('../controllers/achievementController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation rules for achievement creation/update
const achievementValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters')
    .trim(),
  body('date')
    .custom((value) => {
      if (!value) return false;
      const d = new Date(value);
      return !isNaN(d.getTime());
    })
    .withMessage('Date must be a valid date')
    .toDate(),
  body('category')
    .optional()
    .isIn(['award', 'milestone', 'certification', 'recognition'])
    .withMessage('Invalid category'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean')
    .toBoolean()
];

// Public routes
router.get('/', getAchievements);

// Protected routes (Admin only) with proper upload middleware
router.post('/', auth, upload.array('images', 10), upload.logSuccess, achievementValidation, createAchievement);
router.put('/:id', auth, upload.array('images', 10), upload.logSuccess, achievementValidation, updateAchievement);
router.delete('/:id', auth, deleteAchievement);

// Add error handling for upload routes
router.use(upload.handleError);

module.exports = router;
