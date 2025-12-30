const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const verifyAndCreateAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/linkedin-company?retryWrites=true&w=majority&appName=ZEYA-7";
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('✅ Connected to MongoDB');

    // Remove existing admin if any
    await Admin.deleteMany({});
    console.log('🗑️  Removed existing admin users');

    // Create new admin user with direct password hashing
    const admin = new Admin({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'admin'
    });

    await admin.save();
    console.log('✅ New admin user created successfully!');

    // Test password verification
    const testAdmin = await Admin.findOne({ email: 'admin@example.com' });
    const isPasswordValid = await testAdmin.comparePassword('admin123');
    
    console.log('🔍 Password verification test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    console.log('='.repeat(50));
    console.log('LOGIN CREDENTIALS:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyAndCreateAdmin();
