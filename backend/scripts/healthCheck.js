const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const checkDependencies = () => {
  console.log('🔍 Checking dependencies...');
  
  const requiredDirs = [
    'uploads',
    'uploads/images',
    'logs'
  ];
  
  requiredDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

const checkEnvironmentVariables = () => {
  console.log('🔍 Checking environment variables...');
  
  const required = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];
  
  const missing = [];
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n📝 Please create a .env file in the backend directory with:');
    console.error('MONGODB_URI=your_mongodb_connection_string');
    console.error('JWT_SECRET=your_jwt_secret_key_min_32_chars');
    return false;
  }
  
  // Check JWT_SECRET length
  if (process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long for security');
  }
  
  console.log('✅ Environment variables check passed');
  return true;
};

const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 1
    });
    
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database connection successful');
    
    // Test basic operations
    const Admin = require('../models/Admin');
    const adminCount = await Admin.countDocuments();
    console.log(`📊 Found ${adminCount} admin user(s) in database`);
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify MongoDB URI is correct');
    console.error('   3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('   4. Check if MongoDB cluster is running');
    return false;
  }
};

const checkServerPorts = () => {
  console.log('🔍 Checking server ports...');
  
  const net = require('net');
  const ports = [8000, 5001];
  
  return Promise.all(ports.map(port => {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.close(() => {
          console.log(`✅ Port ${port} is available`);
          resolve(true);
        });
      });
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`⚠️  Port ${port} is already in use`);
        }
        resolve(false);
      });
    });
  }));
};

const runHealthCheck = async () => {
  console.log('🏥 Running comprehensive health check...\n');
  
  try {
    // Check dependencies
    checkDependencies();
    console.log('');
    
    // Check environment variables
    const envCheck = checkEnvironmentVariables();
    if (!envCheck) {
      process.exit(1);
    }
    console.log('');
    
    // Check database connection
    const dbCheck = await testDatabaseConnection();
    if (!dbCheck) {
      process.exit(1);
    }
    console.log('');
    
    // Check ports
    await checkServerPorts();
    console.log('');
    
    console.log('🎉 Health check completed successfully!');
    console.log('='.repeat(50));
    console.log('🚀 Your application is ready to start!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Start backend: cd backend && npm start');
    console.log('   2. Start frontend: cd frontend && PORT=5001 npm start');
    console.log('   3. Visit: http://localhost:5001');
    console.log('   4. Admin panel: http://localhost:5001/admin');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
};

// Export for use in other modules
const healthCheck = {
  checkDependencies,
  checkEnvironmentVariables,
  testDatabaseConnection,
  checkServerPorts,
  runHealthCheck
};

// Run if called directly
if (require.main === module) {
  runHealthCheck();
}

module.exports = healthCheck;