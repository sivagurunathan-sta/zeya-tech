// backend/routes/contentRoutes.js
const express = require('express');
const { getContent, getAllContent, updateContent } = require('../controllers/contentController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllContent);
router.get('/:section', getContent);

// Protected routes with proper upload middleware
router.put('/:section', auth, upload.array('images', 5), upload.logSuccess, updateContent);

// Add error handling for upload routes
router.use(upload.handleError);

module.exports = router;