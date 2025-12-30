// backend/routes/projectRoutes.js
const express = require('express');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  updateProjectProgress
} = require('../controllers/projectController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/stats', getProjectStats);
router.get('/:id', getProjectById);

// Protected routes (Admin only) with proper upload middleware
router.post('/', auth, upload.array('images', 5), upload.logSuccess, createProject);
router.put('/:id', auth, upload.array('images', 5), upload.logSuccess, updateProject);
router.patch('/:id/progress', auth, updateProjectProgress);
router.delete('/:id', auth, deleteProject);

// Add error handling for upload routes
router.use(upload.handleError);

module.exports = router;