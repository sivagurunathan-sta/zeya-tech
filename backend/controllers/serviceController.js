const Service = require('../models/Service');
const { validationResult } = require('express-validator');
const { logger } = require('../middleware/logger');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    console.log('🔍 Getting services...');
    const { category, popular, active } = req.query;

    // Build filter
    let filter = {};
    if (active === 'true') {
      filter.active = true;
    } else if (active === 'false') {
      filter.active = false;
    }

    if (category) {
      filter.category = category;
    }

    if (popular !== undefined) {
      filter.popular = popular === 'true';
    }

    console.log('📊 Service filter:', filter);

    const services = await Service.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    console.log('✅ Found services:', { count: services.length });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('❌ Error fetching services:', error);
    logger.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services',
      data: []
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    logger.error('Error fetching service:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service'
    });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin only)
const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const payload = { ...req.body };

    // Normalize arrays when sent as strings
    if (typeof payload.features === 'string') {
      payload.features = payload.features.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof payload.tags === 'string') {
      payload.tags = payload.tags.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      payload.images = req.files.map(file => ({
        url: `/uploads/images/${file.filename}`,
        alt: file.originalname,
        caption: ''
      }));
    }

    const service = await Service.create(payload);

    logger.info(`Service created: ${service.title} by admin ${req.admin?.id || 'unknown'}`);

    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully'
    });
  } catch (error) {
    logger.error('Error creating service:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating service'
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin only)
const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const update = { ...req.body };

    if (typeof update.features === 'string') {
      update.features = update.features.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof update.tags === 'string') {
      update.tags = update.tags.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (req.files && req.files.length > 0) {
      update.images = req.files.map(file => ({
        url: `/uploads/images/${file.filename}`,
        alt: file.originalname,
        caption: ''
      }));
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
        runValidators: true
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    logger.info(`Service updated: ${service.title} by admin ${req.admin?.id || 'unknown'}`);

    res.status(200).json({
      success: true,
      data: service,
      message: 'Service updated successfully'
    });
  } catch (error) {
    logger.error('Error updating service:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating service'
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin only)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await service.deleteOne();

    logger.info(`Service deleted: ${service.title} by admin ${req.admin?.id || 'unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting service:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting service'
    });
  }
};

// @desc    Toggle service active status
// @route   PATCH /api/services/:id/toggle
// @access  Private (Admin only)
const toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    service.active = !service.active;
    await service.save();

    logger.info(`Service status toggled: ${service.title} (${service.active ? 'activated' : 'deactivated'}) by admin ${req.admin?.id || 'unknown'}`);

    res.status(200).json({
      success: true,
      data: service,
      message: `Service ${service.active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    logger.error('Error toggling service status:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while toggling service status'
    });
  }
};

// @desc    Reorder services
// @route   POST /api/services/reorder
// @access  Private (Admin only)
const reorderServices = async (req, res) => {
  try {
    const { serviceOrders } = req.body;

    if (!Array.isArray(serviceOrders)) {
      return res.status(400).json({
        success: false,
        message: 'Service orders must be an array'
      });
    }

    // Update order for each service
    const updatePromises = serviceOrders.map(({ id, order }) =>
      Service.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    logger.info(`Services reordered by admin ${req.admin?.id || 'unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Services reordered successfully'
    });
  } catch (error) {
    logger.error('Error reordering services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reordering services'
    });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  reorderServices
};
