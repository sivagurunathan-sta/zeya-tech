const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Content = require('../models/Content');
const Service = require('../models/Service');
const Team = require('../models/Team');
require('dotenv').config();

const sampleContent = [
  {
    section: 'hero',
    title: 'Building the Future Together',
    subtitle: 'Innovation Starts Here',
    content: 'We create innovative solutions that drive success and build lasting partnerships with our clients worldwide. Our team is dedicated to transforming ideas into reality.',
    images: []
  },
  {
    section: 'about',
    title: 'About Our Company',
    subtitle: 'Excellence in Every Project',
    content: 'We are a professional technology company dedicated to delivering excellence in all our projects and services. With years of experience and a passionate team, we help businesses achieve their digital transformation goals.',
    images: []
  },
  {
    section: 'home',
    title: 'Welcome to Our Digital World',
    subtitle: 'Your Success is Our Mission',
    content: 'We provide cutting-edge technology solutions to help your business grow and succeed in the digital world. From web development to mobile applications, we have the expertise to bring your vision to life.',
    images: []
  },
  {
    section: 'services',
    title: 'Our Premium Services',
    subtitle: 'Comprehensive Solutions for Your Business',
    content: 'We offer a wide range of services including web development, mobile app development, cloud solutions, digital marketing, and IT consulting. Our team works closely with clients to understand their unique needs and deliver customized solutions.',
    images: []
  }
];

const sampleTeam = [
  {
    name: 'John Smith',
    position: 'CEO & Founder',
    department: 'Leadership',
    email: 'john@company.com',
    bio: 'Experienced leader with 10+ years in technology.',
    isActive: true,
    joinDate: new Date('2020-01-01')
  },
  {
    name: 'Jane Smith',
    position: 'CTO',
    department: 'Technology',
    email: 'jane@company.com',
    bio: 'Technology expert driving innovation.',
    isActive: true,
    joinDate: new Date('2020-06-01')
  },
  {
    name: 'Mike Johnson',
    position: 'Lead Developer',
    department: 'Technology',
    email: 'mike@company.com',
    bio: 'Full-stack developer with expertise in modern frameworks.',
    isActive: true,
    joinDate: new Date('2021-03-01')
  }
];

const fullSetup = async () => {
  try {
    console.log('🚀 Starting full application setup...\n');

    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/?retryWrites=true&w=majority&appName=ZEYA-7";
    
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('✅ Connected to MongoDB successfully!\n');

    // Test database connection
    await mongoose.connection.db.admin().ping();
    console.log('🏓 Database ping successful\n');

    // Setup Admin User
    console.log('👤 Setting up admin user...');
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
    } else {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);

      const admin = new Admin({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    // Setup Content
    console.log('\n📝 Setting up content...');
    const existingContent = await Content.countDocuments();
    
    if (existingContent > 0) {
      console.log(`✅ Content already exists (${existingContent} items)`);
    } else {
      console.log('📝 Creating sample content...');
      for (const contentData of sampleContent) {
        try {
          const content = new Content(contentData);
          await content.save();
          console.log(`   ✅ Created content for section: ${contentData.section}`);
        } catch (error) {
          console.error(`   ❌ Error creating content for ${contentData.section}:`, error.message);
        }
      }
    }

    // Setup Services
    console.log('\n🛠️ Setting up services...');
    const existingServices = await Service.countDocuments();
    
    if (existingServices > 0) {
      console.log(`✅ Services already exist (${existingServices} services)`);
    } else {
      console.log('🛠️ Creating default services...');
      try {
        await Service.createDefaults();
        console.log('✅ Default services created successfully!');
      } catch (error) {
        console.error('❌ Error creating services:', error.message);
      }
    }

    // Setup Team
    console.log('\n👥 Setting up team members...');
    const existingTeam = await Team.countDocuments();
    
    if (existingTeam > 0) {
      console.log(`✅ Team members already exist (${existingTeam} members)`);
    } else {
      console.log('👥 Creating sample team members...');
      for (const teamData of sampleTeam) {
        try {
          const teamMember = new Team(teamData);
          await teamMember.save();
          console.log(`   ✅ Created team member: ${teamData.name}`);
        } catch (error) {
          console.error(`   ❌ Error creating team member ${teamData.name}:`, error.message);
        }
      }
    }

    // Final verification
    console.log('\n🔍 Verifying setup...');
    const adminCount = await Admin.countDocuments();
    const contentCount = await Content.countDocuments();
    const serviceCount = await Service.countDocuments();
    const teamCount = await Team.countDocuments();
    
    console.log(`   📊 Admin users: ${adminCount}`);
    console.log(`   📊 Content items: ${contentCount}`);
    console.log(`   📊 Services: ${serviceCount}`);
    console.log(`   📊 Team members: ${teamCount}`);

    console.log('\n🎉 Setup completed successfully!');
    console.log('='.repeat(50));
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('='.repeat(50));
    console.log('🌐 Access your admin panel at: http://localhost:5001/admin');
    console.log('⚠️  Please change the password after first login');
    console.log('\n✨ Your application is ready to use!');
    console.log('\n📚 Available Features:');
    console.log('   • Content Management (Hero, About, Services, Home)');
    console.log('   • Services Management');
    console.log('   • Team Management');
    console.log('   • Projects & Achievements');
    console.log('   • Contact Form');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify MongoDB Atlas connection string');
    console.error('   3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('   4. Try running the setup again');
    process.exit(1);
  }
};

// Run the full setup
fullSetup();
