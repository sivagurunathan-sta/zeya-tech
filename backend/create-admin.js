// backend/create-admin.js
// Save this file in the backend directory and run: node create-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const createAdmin = async () => {
  try {
    console.log('🚀 Starting admin creation...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('\n🔄 Deleting existing admin to create fresh one...');
      await Admin.deleteOne({ email: 'admin@example.com' });
      console.log('✅ Existing admin deleted\n');
    }

    // Create new admin user
    console.log('👤 Creating new admin user...');
    const admin = new Admin({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // This will be automatically hashed by the model
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!\n');

    // Verify the admin was created
    const verifyAdmin = await Admin.findOne({ email: 'admin@example.com' });
    console.log('🔍 Verification:');
    console.log('   ID:', verifyAdmin._id);
    console.log('   Username:', verifyAdmin.username);
    console.log('   Email:', verifyAdmin.email);
    console.log('   Role:', verifyAdmin.role);
    console.log('   Active:', verifyAdmin.isActive);
    console.log('   Password Hashed:', verifyAdmin.password ? '✅ Yes' : '❌ No');
    console.log('');

    // Test password verification
    console.log('🔐 Testing password verification...');
    const passwordTest = await verifyAdmin.comparePassword('admin123');
    console.log('   Password test:', passwordTest ? '✅ PASSED' : '❌ FAILED');
    console.log('');

    if (!passwordTest) {
      console.log('❌ WARNING: Password verification failed!');
      console.log('   This might indicate an issue with password hashing.');
    }

    console.log('='.repeat(60));
    console.log('🎉 SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('   Email:    admin@example.com');
    console.log('   Password: admin123');
    console.log('\n🌐 Access your admin panel at:');
    console.log('   http://localhost:5001/admin/login');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('='.repeat(60));

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating admin:', error);
    
    if (error.code === 11000) {
      console.log('\n💡 Duplicate key error - admin might already exist.');
      console.log('   Try deleting the existing admin first.');
    }
    
    process.exit(1);
  }
};

// Run the script
createAdmin();