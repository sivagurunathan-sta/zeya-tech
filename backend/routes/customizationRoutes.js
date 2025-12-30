const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Fixed import
const upload = require('../middleware/upload');
const {
  getCustomization,
  updateCustomization,
  resetCustomization,
  getAvailableFonts
} = require('../controllers/customizationController');

// Public routes
router.get('/', getCustomization);
router.get('/fonts', getAvailableFonts);

// Protected admin routes
router.put('/', auth, updateCustomization); // Fixed middleware name
router.post('/reset', auth, resetCustomization); // Fixed middleware name

module.exports = router;
