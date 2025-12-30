const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/?retryWrites=true&w=majority&appName=ZEYA-7";
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('✅ Connected to MongoDB');

    // Remove existing admin and create fresh one
    await Admin.deleteMany({ email: 'zeya@gmail.com' });
    console.log('🗑️  Removed existing admin users');

    // Create admin user (password will be hashed by pre-save middleware)
    const admin = new Admin({
      username: 'zeya',
      email: 'zeya@gmail.com',
      password: 'zeya7techworld@?', // This will be hashed by the model's pre-save middleware
      role: 'admin',
      isActive: true
    });

    await admin.save();

    console.log('🎉 Admin user created successfully!');
    console.log('='.repeat(40));
    console.log('Login Credentials:');
    console.log('Username: zeya');
    console.log('Email: zeya@gmail.com');
    console.log('Password: zeya7techworld@?');
    console.log('='.repeat(40));
    console.log('⚠️  Please keep credentials secure!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the admin creation
createAdminUser();
