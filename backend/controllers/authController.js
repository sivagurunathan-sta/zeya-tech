const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('📝 Registration attempt:', { username, email, passwordLength: password?.length });

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      console.log('❌ Admin already exists:', { username, email });
      return res.status(400).json({ 
        success: false,
        message: 'Admin already exists' 
      });
    }

    // Create new admin
    const admin = await Admin.create({
      username,
      email,
      password
    });

    const token = generateToken(admin._id);

    console.log('✅ Admin created successfully:', { username, email, id: admin._id });

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseError') {
      return res.status(503).json({ 
        success: false,
        message: 'Database connection error. Please try again later.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Registration failed' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    console.log('🔐 Login attempt:', { 
      email, 
      username,
      passwordProvided: !!password,
      passwordLength: password?.length 
    });

    // Validate input
    if ((!email && !username) || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email/username and password' 
      });
    }

    // Build query - support both email and username login
    let query = {};
    if (email) {
      query.email = email.toLowerCase();
    } else if (username) {
      query.username = username;
    }

    console.log('🔍 Searching for admin with query:', query);

    // Find admin and include password field
    const admin = await Admin.findOne(query).select('+password');
    
    console.log('👤 Admin found:', {
      found: !!admin,
      id: admin?._id,
      username: admin?.username,
      email: admin?.email,
      hasPassword: !!admin?.password
    });

    if (!admin) {
      console.log('❌ No admin found with provided credentials');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    console.log('🔐 Comparing passwords...');
    const isPasswordValid = await admin.comparePassword(password);
    console.log('🔐 Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(admin._id);
    console.log('✅ Login successful, token generated');

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseError') {
      return res.status(503).json({ 
        success: false,
        message: 'Database connection error. Please try again later.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Login failed' 
    });
  }
};

const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      admin
    });
  } catch (error) {
    console.error('❌ Get me error:', error);
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseError') {
      return res.status(503).json({ 
        success: false,
        message: 'Database connection error. Please try again later.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to get user info' 
    });
  }
};

// Debug endpoint to check admin users (remove in production)
const debugAdmins = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const admins = await Admin.find({}).select('-password');
    const count = await Admin.countDocuments();
    
    console.log('👥 Debug - Admin users in database:', {
      count,
      users: admins.map(admin => ({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }))
    });

    res.json({
      success: true,
      count,
      admins: admins.map(admin => ({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Debug admins error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateMe = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;

    console.log('🔄 Profile update attempt:', {
      username,
      email,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
      adminId: req.admin?.id,
      requestBody: { ...req.body, currentPassword: '[HIDDEN]', newPassword: '[HIDDEN]' }
    });

    if (!req.admin || !req.admin.id) {
      console.log('❌ No admin ID in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find admin and include password field
    const admin = await Admin.findById(req.admin.id).select('+password');
    console.log('👤 Found admin:', { id: admin?._id, username: admin?.username, email: admin?.email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }

      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      admin.password = newPassword; // Pre-save hook will hash it
    }

    // Update username if provided
    if (username && username !== admin.username) {
      // Check if username is already taken by another admin
      const existingAdmin = await Admin.findOne({
        username,
        _id: { $ne: req.admin.id }
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }

      admin.username = username;
    }

    // Update email if provided
    if (email && email !== admin.email) {
      // Check if email is already taken by another admin
      const existingAdmin = await Admin.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.admin.id }
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }

      admin.email = email.toLowerCase();
    }

    await admin.save();

    console.log('✅ Profile updated successfully:', {
      username: admin.username,
      email: admin.email
    });

    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);

    if (error.name === 'MongoNetworkError' || error.name === 'MongooseError') {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Profile update failed'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  debugAdmins
};
