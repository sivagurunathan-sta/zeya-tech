// backend/routes/teamRoutes.js
const express = require('express');
const {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  hardDeleteTeamMember,
  getTeamStats,
  getDepartments,
  searchTeamMembers
} = require('../controllers/teamController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getTeamMembers);
router.get('/search', searchTeamMembers);
router.get('/stats', getTeamStats);
router.get('/departments', getDepartments);
router.get('/:id', getTeamMemberById);

// Protected routes (Admin only) with proper upload middleware
router.post('/', auth, upload.single('image'), upload.logSuccess, createTeamMember);
router.put('/:id', auth, upload.single('image'), upload.logSuccess, updateTeamMember);
router.delete('/:id', auth, deleteTeamMember);
router.delete('/:id/permanent', auth, hardDeleteTeamMember);

// Add error handling for upload routes
router.use(upload.handleError);

module.exports = router;