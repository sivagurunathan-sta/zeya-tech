const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/?retryWrites=true&w=majority&appName=ZEYA-7";
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
      family: 4,
      retryWrites: true
    });
    
    console.log('✅ MongoDB Atlas Connected Successfully!');

    // Test database operations
    console.log('🔍 Testing database operations...');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists!');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
    } else {
      // Create new admin user
      const admin = new Admin({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123'
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
    }

    // Test database ping
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful!');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('🌐 Frontend: http://localhost:5001');
    console.log('🔧 Backend API: http://localhost:8000');
    console.log('👤 Admin Panel: http://localhost:5001/admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup error:', error);
    process.exit(1);
  }
};

setupDatabase();
