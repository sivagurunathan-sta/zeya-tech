const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createAdmin = async () => {
  try {
    console.log('🚀 Starting admin creation process...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/linkedin-company";
    console.log('📡 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log('✅ Connected to MongoDB');

    // Check if any admin already exists
    const adminCount = await Admin.countDocuments();
    console.log('👥 Current admin count:', adminCount);

    if (adminCount > 0) {
      console.log('ℹ️  Admin users already exist. Let me show you the existing admins:');
      
      const admins = await Admin.find({}).select('-password');
      admins.forEach((admin, index) => {
        console.log(`👤 Admin ${index + 1}:`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('');
      });

      console.log('💡 You can login with any of the above credentials.');
      console.log('💡 Default password is usually: zeya7techworld@?');
      console.log('');
      console.log('🔄 If you want to create a new admin or reset password, delete existing admins first.');
      
      process.exit(0);
    }

    // Create new admin user
    console.log('📝 Creating new admin user...');
    
    const adminData = {
      username: 'zeya',
      email: 'zeya@gmail.com',
      password: 'zeya7techworld@?',
      role: 'admin'
    };

    const admin = await Admin.create(adminData);

    console.log('🎉 Admin user created successfully!');
    console.log('='.repeat(50));
    console.log('📋 LOGIN CREDENTIALS:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log('   Password: zeya7techworld@?');
    console.log(`   Role: ${admin.role}`);
    console.log('='.repeat(50));
    console.log('⚠️  IMPORTANT: Keep these credentials secure!');
    console.log('🌐 You can now login at: http://localhost:5001/admin/login');

    // Test password hashing
    console.log('🔐 Testing password verification...');
    const isPasswordValid = await admin.comparePassword('zeya7techworld@?');
    console.log('🔐 Password test result:', isPasswordValid ? '✅ PASSED' : '❌ FAILED');
    
    if (!isPasswordValid) {
      console.log('⚠️  Warning: Password verification failed. There might be an issue with password hashing.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    
    if (error.code === 11000) {
      console.log('');
      console.log('💡 This error means an admin with this username/email already exists.');
      console.log('💡 Try using different credentials or delete existing admin first.');
    }
    
    process.exit(1);
  }
};

// Helper function to delete all admins (use carefully!)
const deleteAllAdmins = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/linkedin-company";
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    const result = await Admin.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} admin users`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting admins:', error);
    process.exit(1);
  }
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--delete-all')) {
  console.log('⚠️  WARNING: This will delete ALL admin users!');
  console.log('⚠️  Press Ctrl+C within 5 seconds to cancel...');
  setTimeout(() => {
    deleteAllAdmins();
  }, 5000);
} else {
  createAdmin();
}

module.exports = { createAdmin, deleteAllAdmins };
