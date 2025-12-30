const express = require('express');
const authRoutes = require('./authRoutes');
const contentRoutes = require('./contentRoutes');
const achievementRoutes = require('./achievementRoutes');
const projectRoutes = require('./projectRoutes');
const teamRoutes = require('./teamRoutes');
const contactRoutes = require('./contactRoutes');
const serviceRoutes = require('./serviceRoutes');
const customizationRoutes = require('./customizationRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/achievements', achievementRoutes);
router.use('/projects', projectRoutes);
router.use('/team', teamRoutes);
router.use('/contact', contactRoutes);
router.use('/services', serviceRoutes);
router.use('/customizations', customizationRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

module.exports = router;
