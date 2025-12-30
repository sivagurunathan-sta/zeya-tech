const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Achievement = require('../models/Achievement');

// Helper function to check database connection
const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Fallback achievement data
const getFallbackAchievements = () => [
  {
    _id: '673d1234567890abcdef0001',
    title: 'Company Founded',
    description: 'Successfully launched our company with a vision to innovate and transform the digital landscape.',
    date: new Date('2020-01-01'),
    category: 'milestone',
    featured: true,
    images: [],
    documents: [],
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2020-01-01')
  },
  {
    _id: '673d1234567890abcdef0002',
    title: 'First Major Client',
    description: 'Secured our first enterprise-level client contract worth $100K.',
    date: new Date('2020-06-01'),
    category: 'milestone',
    featured: false,
    images: [],
    documents: [],
    createdAt: new Date('2020-06-01'),
    updatedAt: new Date('2020-06-01')
  },
  {
    _id: '673d1234567890abcdef0003',
    title: 'Best Innovation Award 2023',
    description: 'Received the prestigious Best Innovation Award for our groundbreaking AI solutions.',
    date: new Date('2023-01-15'),
    category: 'award',
    featured: true,
    images: [],
    documents: [],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    _id: '673d1234567890abcdef0004',
    title: 'ISO 27001 Certification',
    description: 'Successfully obtained ISO 27001 certification for information security management.',
    date: new Date('2023-06-10'),
    category: 'certification',
    featured: false,
    images: [],
    documents: [],
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10')
  },
  {
    _id: '673d1234567890abcdef0005',
    title: '500+ Projects Milestone',
    description: 'Reached the remarkable milestone of 500 successfully completed projects.',
    date: new Date('2024-01-01'),
    category: 'milestone',
    featured: true,
    images: [],
    documents: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const getAchievements = async (req, res) => {
  try {
    console.log('🔍 Getting achievements...');

    // Check database connection
    if (!checkDBConnection()) {
      console.log('⚠️ Database not connected, returning fallback data');
      const fallbackAchievements = getFallbackAchievements();
      const fallbackWithId = fallbackAchievements.map(a => ({ ...a, id: a._id }));
      return res.json({
        success: true,
        data: {
          achievements: fallbackWithId,
          pagination: {
            page: 1,
            pages: 1,
            limit: fallbackWithId.length,
            total: fallbackWithId.length
          }
        },
        source: 'fallback'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Increased limit for admin
    const skip = (page - 1) * limit;

    console.log('📊 Query params:', { page, limit, skip });

    const achievements = await Achievement.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for better performance

    const total = await Achievement.countDocuments();

    console.log('✅ Found achievements:', { count: achievements.length, total });

    const normalized = achievements.map(a => ({ ...a, id: a._id?.toString?.() || a._id }));

    const response = {
      success: true,
      data: {
        achievements: normalized,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error in getAchievements:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {
        achievements: [],
        pagination: {
          page: 1,
          pages: 0,
          total: 0,
          limit: 50
        }
      }
    });
  }
};

const createAchievement = async (req, res) => {
  try {
    console.log('🏆 Creating achievement with data:', req.body);
    console.log('📁 Files received:', req.files ? req.files.length : 0);
    console.log('📋 Form fields received:', {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      category: req.body.category,
      featured: req.body.featured
    });
    console.log('🔍 Request headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    console.log('🔍 Raw req.body type:', typeof req.body);
    console.log('🔍 All body keys:', Object.keys(req.body));

    // Log all files if any
    if (req.files && req.files.length > 0) {
      console.log('���� File details:');
      req.files.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
      });
    }

    // Check validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    // Additional manual validation for required fields
    const { title, description, date } = req.body;
    if (!title || !description || !date) {
      console.log('❌ Missing required fields:', { title: !!title, description: !!description, date: !!date });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, and date are required'
      });
    }

    const achievementData = { ...req.body };

    // Handle file uploads (using upload.array like services)
    if (req.files && req.files.length > 0) {
      const images = [];
      const documents = [];

      req.files.forEach(file => {
        console.log(`📁 Processing file: ${file.originalname}, Type: ${file.mimetype}`);

        if (file.mimetype.startsWith('image/')) {
          // It's an image
          images.push({
            url: `/uploads/images/${file.filename}`,
            alt: file.originalname,
            caption: req.body.caption || ''
          });
          console.log('🖼️ Added to images:', file.originalname);
        } else {
          // It's a document
          documents.push({
            url: `/uploads/documents/${file.filename}`,
            name: file.originalname,
            type: file.mimetype
          });
          console.log('📄 Added to documents:', file.originalname);
        }
      });

      if (images.length > 0) {
        achievementData.images = images;
        console.log('✅ Total images added:', images.length);
      }

      if (documents.length > 0) {
        achievementData.documents = documents;
        console.log('✅ Total documents added:', documents.length);
      }
    }

    console.log('💾 Creating achievement with final data:', {
      title: achievementData.title,
      category: achievementData.category,
      date: achievementData.date,
      featured: achievementData.featured,
      imagesCount: achievementData.images?.length || 0,
      documentsCount: achievementData.documents?.length || 0
    });

    const achievement = await Achievement.create(achievementData);

    console.log('✅ Achievement created successfully:', achievement._id);

    const out = achievement.toObject ? achievement.toObject() : achievement;
    out.id = out._id;
    res.status(201).json({
      success: true,
      data: { achievement: out },
      message: 'Achievement created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating achievement:', error);

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
      message: error.message || 'Server error while creating achievement'
    });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔧 Updating achievement:', id);
    console.log('📁 Files received:', req.files ? req.files.length : 0);

    // Check validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const updateData = { ...req.body };

    // Handle file uploads (using upload.array like services)
    if (req.files && req.files.length > 0) {
      const images = [];
      const documents = [];

      req.files.forEach(file => {
        console.log(`📁 Processing file: ${file.originalname}, Type: ${file.mimetype}`);

        if (file.mimetype.startsWith('image/')) {
          // It's an image
          images.push({
            url: `/uploads/images/${file.filename}`,
            alt: file.originalname,
            caption: req.body.caption || ''
          });
          console.log('🖼️ Added to images:', file.originalname);
        } else {
          // It's a document
          documents.push({
            url: `/uploads/documents/${file.filename}`,
            name: file.originalname,
            type: file.mimetype
          });
          console.log('📄 Added to documents:', file.originalname);
        }
      });

      if (images.length > 0) {
        updateData.images = images;
        console.log('✅ Total images updated:', images.length);
      }

      if (documents.length > 0) {
        updateData.documents = documents;
        console.log('��� Total documents updated:', documents.length);
      }
    }

    const achievement = await Achievement.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    console.log('✅ Achievement updated successfully:', id);

    const out = achievement.toObject ? achievement.toObject() : achievement;
    out.id = out._id;
    res.json({
      success: true,
      data: { achievement: out },
      message: 'Achievement updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating achievement:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
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
      message: error.message || 'Server error while updating achievement'
    });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting achievement:', id);

    const achievement = await Achievement.findByIdAndDelete(id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    console.log('✅ Achievement deleted successfully:', achievement.title);

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting achievement:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting achievement'
    });
  }
};

module.exports = {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement
};
