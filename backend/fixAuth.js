// Save this as backend/fixAuth.js and run with: node fixAuth.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Console colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(colors[color] + message + colors.reset);
};

// Define Admin Schema
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Password hashing middleware
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    log('🔐 Hashing password...', 'yellow');
    this.password = await bcrypt.hash(this.password, 12);
    log('✅ Password hashed successfully', 'green');
    next();
  } catch (error) {
    log('❌ Error hashing password: ' + error.message, 'red');
    next(error);
  }
});

// Password comparison method
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password || !candidatePassword) {
      log('❌ Missing password or candidate', 'red');
      return false;
    }
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    log(`🔐 Password comparison: ${result ? 'SUCCESS' : 'FAILED'}`, result ? 'green' : 'red');
    return result;
  } catch (error) {
    log('❌ Password comparison error: ' + error.message, 'red');
    return false;
  }
};

const Admin = mongoose.model('Admin', AdminSchema);

async function fixAuthentication() {
  try {
    log('🚀 Starting Authentication Fix Process', 'cyan');
    log('=====================================', 'cyan');
    
    // Step 1: Connect to MongoDB
    log('\n📡 Step 1: Connecting to MongoDB...', 'blue');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/linkedin-company';
    log(`Connection string: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`, 'yellow');
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    log('✅ MongoDB connected successfully', 'green');
    log(`Database: ${mongoose.connection.name}`, 'yellow');
    log(`Host: ${mongoose.connection.host}`, 'yellow');
    
    // Step 2: Check existing admins
    log('\n👥 Step 2: Checking existing admins...', 'blue');
    
    const adminCount = await Admin.countDocuments();
    log(`Found ${adminCount} admin(s) in database`, 'yellow');
    
    let testAdmin = null;
    
    if (adminCount > 0) {
      log('📋 Existing admins:', 'yellow');
      const admins = await Admin.find({}).select('+password');
      
      admins.forEach((admin, index) => {
        log(`  ${index + 1}. Username: ${admin.username}`, 'yellow');
        log(`     Email: ${admin.email}`, 'yellow');
        log(`     Has Password: ${!!admin.password}`, 'yellow');
        log(`     Created: ${admin.createdAt}`, 'yellow');
      });
      
      testAdmin = admins[0];
    } else {
      log('⚠️  No admins found. Creating default admin...', 'yellow');
      
      testAdmin = await Admin.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      
      log('✅ Default admin created successfully!', 'green');
    }
    
    // Step 3: Test password functionality
    log('\n🧪 Step 3: Testing password functionality...', 'blue');
    
    if (!testAdmin) {
      log('❌ No test admin available', 'red');
      return;
    }
    
    log(`Testing with admin: ${testAdmin.username} (${testAdmin.email})`, 'yellow');
    
    // Test correct password
    log('\n🔐 Testing correct password "admin123"...', 'yellow');
    const correctResult = await testAdmin.comparePassword('admin123');
    log(`Result: ${correctResult ? '✅ SUCCESS' : '❌ FAILED'}`, correctResult ? 'green' : 'red');
    
    // Test incorrect password
    log('\n🔐 Testing incorrect password "wrong"...', 'yellow');
    const incorrectResult = await testAdmin.comparePassword('wrong');
    log(`Result: ${!incorrectResult ? '✅ SUCCESS (correctly rejected)' : '❌ FAILED (should reject)'}`, !incorrectResult ? 'green' : 'red');
    
    // Manual bcrypt test
    log('\n🔧 Manual bcrypt verification...', 'yellow');
    if (testAdmin.password) {
      const manualResult = await bcrypt.compare('admin123', testAdmin.password);
      log(`Manual bcrypt result: ${manualResult ? '✅ SUCCESS' : '❌ FAILED'}`, manualResult ? 'green' : 'red');
    }
    
    // Step 4: Test database queries
    log('\n🔍 Step 4: Testing database queries...', 'blue');
    
    const byEmail = await Admin.findOne({ email: 'admin@example.com' }).select('+password');
    log(`Find by email: ${byEmail ? '✅ SUCCESS' : '❌ FAILED'}`, byEmail ? 'green' : 'red');
    
    const byUsername = await Admin.findOne({ username: 'admin' }).select('+password');
    log(`Find by username: ${byUsername ? '✅ SUCCESS' : '❌ FAILED'}`, byUsername ? 'green' : 'red');
    
    // Step 5: Test login simulation
    log('\n🚪 Step 5: Simulating login process...', 'blue');
    
    const loginTest = async (identifier, password) => {
      log(`Attempting login with: ${identifier} / ${password}`, 'yellow');
      
      // Find admin
      const admin = await Admin.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { username: identifier }
        ]
      }).select('+password');
      
      if (!admin) {
        log('❌ Admin not found', 'red');
        return false;
      }
      
      log('✅ Admin found', 'green');
      
      // Check password
      const isValidPassword = await admin.comparePassword(password);
      log(`Password valid: ${isValidPassword ? '✅ YES' : '❌ NO'}`, isValidPassword ? 'green' : 'red');
      
      return isValidPassword;
    };
    
    // Test various login combinations
    await loginTest('admin@example.com', 'admin123');
    await loginTest('admin', 'admin123');
    await loginTest('admin@example.com', 'wrong');
    
    // Step 6: Final summary
    log('\n📊 FINAL SUMMARY', 'cyan');
    log('================', 'cyan');
    
    const allTestsPassed = correctResult && !incorrectResult && byEmail && byUsername;
    
    if (allTestsPassed) {
      log('🎉 ALL TESTS PASSED! Authentication is working correctly.', 'green');
      log('\n📋 You can now login with:', 'green');
      log('  Username: admin', 'green');
      log('  Email: admin@example.com', 'green');
      log('  Password: admin123', 'green');
      log('\n💡 Try these login requests:', 'yellow');
      log('  POST http://localhost:8000/api/auth/login', 'yellow');
      log('  Body: {"email":"admin@example.com","password":"admin123"}', 'yellow');
    } else {
      log('❌ SOME TESTS FAILED. Please check the errors above.', 'red');
      
      if (!correctResult) {
        log('• Password verification is not working', 'red');
      }
      if (incorrectResult) {
        log('• Password verification is too permissive', 'red');
      }
      if (!byEmail || !byUsername) {
        log('• Database queries are not working', 'red');
      }
    }
    
    // Step 7: Update controller files (optional)
    log('\n🔧 Step 7: Creating updated controller...', 'blue');
    
    const updatedController = `const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const login = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    console.log('🔐 Login attempt:', { email, username, hasPassword: !!password });

    if ((!email && !username) || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email/username and password' 
      });
    }

    // Find admin by email or username
    const admin = await Admin.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { username: username }
      ]
    }).select('+password');

    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await admin.comparePassword(password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(admin._id);
    console.log('✅ Login successful');

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
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
    });
  }
};

module.exports = { login };`;

    const controllerPath = path.join(__dirname, 'controllers', 'authController.js');
    
    if (fs.existsSync(controllerPath)) {
      log(`📝 Backing up existing controller to authController.backup.js`, 'yellow');
      fs.copyFileSync(controllerPath, controllerPath.replace('.js', '.backup.js'));
    }
    
    // Create controllers directory if it doesn't exist
    const controllersDir = path.join(__dirname, 'controllers');
    if (!fs.existsSync(controllersDir)) {
      fs.mkdirSync(controllersDir, { recursive: true });
    }
    
    log('✅ Authentication fix process completed!', 'green');
    
  } catch (error) {
    log('❌ Fix process failed: ' + error.message, 'red');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    log('\n👋 Disconnected from MongoDB', 'yellow');
  }
}

// Run the fix
fixAuthentication();