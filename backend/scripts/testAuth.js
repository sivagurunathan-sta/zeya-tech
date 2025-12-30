const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const testAuth = async () => {
  try {
    console.log('🧪 Starting authentication system test...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/linkedin-company";
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check if admins exist
    console.log('🔍 Test 1: Checking existing admins...');
    const adminCount = await Admin.countDocuments();
    console.log(`   Total admins in database: ${adminCount}`);
    
    if (adminCount === 0) {
      console.log('❌ No admins found! Creating default admin...');
      await Admin.createDefaultAdmin();
      console.log('✅ Default admin created\n');
    } else {
      console.log('✅ Admins exist\n');
    }

    // Test 2: List all admins
    console.log('🔍 Test 2: Listing all admins...');
    const admins = await Admin.find({}).select('+password');
    admins.forEach((admin, index) => {
      console.log(`   Admin ${index + 1}:`);
      console.log(`     ID: ${admin._id}`);
      console.log(`     Username: ${admin.username}`);
      console.log(`     Email: ${admin.email}`);
      console.log(`     Has Password: ${!!admin.password}`);
      console.log(`     Role: ${admin.role}`);
      console.log(`     Active: ${admin.isActive}`);
      console.log('');
    });

    if (admins.length === 0) {
      console.log('❌ Still no admins found after creation attempt!');
      process.exit(1);
    }

    // Test 3: Test password comparison
    console.log('🔍 Test 3: Testing password comparison...');
    const testAdmin = admins[0];
    
    // Test correct password
    console.log('   Testing correct password ("admin123")...');
    const correctPassword = await testAdmin.comparePassword('admin123');
    console.log(`   Result: ${correctPassword ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Test incorrect password
    console.log('   Testing incorrect password ("wrongpassword")...');
    const incorrectPassword = await testAdmin.comparePassword('wrongpassword');
    console.log(`   Result: ${incorrectPassword ? '❌ FAILED (should be false)' : '✅ PASSED'}`);
    
    // Test empty password
    console.log('   Testing empty password...');
    const emptyPassword = await testAdmin.comparePassword('');
    console.log(`   Result: ${emptyPassword ? '❌ FAILED (should be false)' : '✅ PASSED'}\n`);

    // Test 4: Manual bcrypt test
    console.log('🔍 Test 4: Manual bcrypt test...');
    try {
      const testPassword = 'admin123';
      const hash = await bcrypt.hash(testPassword, 12);
      console.log(`   Generated hash: ${hash.substring(0, 20)}...`);
      
      const manualComparison = await bcrypt.compare(testPassword, hash);
      console.log(`   Manual comparison result: ${manualComparison ? '✅ PASSED' : '❌ FAILED'}`);
      
      // Test with stored hash
      if (testAdmin.password) {
        const storedComparison = await bcrypt.compare(testPassword, testAdmin.password);
        console.log(`   Stored hash comparison: ${storedComparison ? '✅ PASSED' : '❌ FAILED'}`);
      }
    } catch (error) {
      console.log(`   ❌ Manual bcrypt test failed: ${error.message}`);
    }
    
    console.log('\n🔍 Test 5: Database query test...');
    
    // Test finding by email
    const adminByEmail = await Admin.findOne({ email: 'admin@example.com' }).select('+password');
    console.log(`   Found admin by email: ${adminByEmail ? '✅ YES' : '❌ NO'}`);
    
    // Test finding by username  
    const adminByUsername = await Admin.findOne({ username: 'admin' }).select('+password');
    console.log(`   Found admin by username: ${adminByUsername ? '✅ YES' : '❌ NO'}`);

    console.log('\n🎉 Authentication test completed!');
    console.log('\n📋 SUMMARY:');
    console.log(`   • Total admins: ${adminCount}`);
    console.log(`   • Password hashing: ${correctPassword ? '✅ Working' : '❌ Broken'}`);
    console.log(`   • Database queries: ${adminByEmail && adminByUsername ? '✅ Working' : '❌ Issues'}`);
    
    if (correctPassword && adminByEmail && adminByUsername) {
      console.log('\n✅ All tests passed! Authentication should work.');
      console.log('\n🔑 Try logging in with:');
      console.log('   Username: admin');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } else {
      console.log('\n❌ Some tests failed. Check the issues above.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run the test
testAuth();