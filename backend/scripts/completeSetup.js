// backend/scripts/completeSetup.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');
const Content = require('../models/Content');
const Team = require('../models/Team');

// Sample content data
const sampleContent = [
  {
    section: 'hero',
    title: 'Building the Future Together',
    subtitle: 'Innovation Through Excellence',
    content: 'We create innovative solutions that drive success and build lasting partnerships with our clients worldwide. Our team is dedicated to transforming ideas into reality with cutting-edge technology and creative expertise.',
    images: [],
    metadata: new Map([
      ['buttonText', 'Get Started'],
      ['buttonLink', '/contact'],
      ['backgroundStyle', 'gradient']
    ])
  },
  {
    section: 'about',
    title: 'About Our Company',
    subtitle: 'Excellence in Every Project',
    content: 'We are a professional technology company dedicated to delivering excellence in all our projects and services. With years of experience and a passionate team, we help businesses achieve their digital transformation goals through innovative solutions and strategic partnerships.',
    images: [],
    metadata: new Map([
      ['mission', 'To empower businesses through innovative technology'],
      ['vision', 'A world where technology seamlessly enhances every business operation'],
      ['values', 'Innovation, Integrity, Excellence, Collaboration']
    ])
  },
  {
    section: 'services',
    title: 'Our Premium Services',
    subtitle: 'Comprehensive Solutions for Your Business',
    content: 'We offer a wide range of services including web development, mobile app development, cloud solutions, digital marketing, and IT consulting. Our experienced team works closely with clients to understand their unique needs and deliver customized solutions that drive growth and success.',
    images: [],
    metadata: new Map([
      ['highlight', 'Full-stack development expertise'],
      ['specialties', 'React, Node.js, Cloud Architecture, Mobile Apps'],
      ['approach', 'Agile methodology with continuous delivery']
    ])
  },
  {
    section: 'home',
    title: 'Welcome to Our Digital World',
    subtitle: 'Your Success is Our Mission',
    content: 'We provide cutting-edge technology solutions to help your business grow and succeed in the digital world. From concept to deployment, our comprehensive services ensure your project exceeds expectations and delivers measurable results.',
    images: [],
    metadata: new Map([
      ['ctaText', 'Start Your Project'],
      ['ctaLink', '/contact'],
      ['features', 'Expert Team, Modern Tech Stack, 24/7 Support']
    ])
  }
];

// Sample team data
const sampleTeam = [
  {
    name: 'John Smith',
    position: 'CEO & Founder',
    department: 'Leadership',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    bio: 'Visionary leader with 15+ years of experience in technology and business strategy. Passionate about building innovative solutions that make a real difference in the world.',
    skills: ['Leadership', 'Strategy', 'Business Development', 'Technology Vision', 'Team Building'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johnsmith',
      twitter: 'https://twitter.com/johnsmith'
    },
    joinDate: new Date('2020-01-01'),
    isActive: true
  },
  {
    name: 'Sarah Johnson',
    position: 'Chief Technology Officer',
    department: 'Engineering',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4568',
    bio: 'Tech enthusiast and full-stack developer with expertise in scalable architecture and team leadership. Drives technical excellence across all projects.',
    skills: ['Full-Stack Development', 'Cloud Architecture', 'DevOps', 'Team Leadership', 'System Design'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      github: 'https://github.com/sarahjohnson'
    },
    joinDate: new Date('2020-03-15'),
    isActive: true
  },
  {
    name: 'Michael Brown',
    position: 'Head of Design',
    department: 'Design',
    email: 'michael.brown@company.com',
    phone: '+1 (555) 123-4569',
    bio: 'Creative designer passionate about user experience and visual storytelling. Creates beautiful, functional designs that users love to interact with.',
    skills: ['UI/UX Design', 'Prototyping', 'Brand Design', 'User Research', 'Design Systems'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/michaelbrown',
      twitter: 'https://twitter.com/mikedesigns'
    },
    joinDate: new Date('2020-06-10'),
    isActive: true
  },
  {
    name: 'Emily Davis',
    position: 'Senior Full-Stack Developer',
    department: 'Engineering',
    email: 'emily.davis@company.com',
    phone: '+1 (555) 123-4570',
    bio: 'Passionate developer with expertise in modern web technologies and agile methodologies. Loves solving complex problems with elegant solutions.',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB', 'TypeScript'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emilydavis',
      github: 'https://github.com/emilydavis'
    },
    joinDate: new Date('2021-02-15'),
    isActive: true
  }
];

// Function to create necessary directories
const createDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/images',
    'logs'
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

// Function to setup admin user
const setupAdmin = async () => {
  console.log('👤 Setting up admin user...');
  
  const existingAdmin = await Admin.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return existingAdmin;
  }

  const admin = new Admin({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });

  await admin.save();
  console.log('✅ Admin user created successfully!');
  return admin;
};

// Function to setup content
const setupContent = async () => {
  console.log('📝 Setting up content...');
  
  const existingContent = await Content.countDocuments();
  if (existingContent > 0) {
    console.log(`✅ Content already exists (${existingContent} items)`);
    return;
  }

  for (const contentData of sampleContent) {
    try {
      const content = new Content(contentData);
      await content.save();
      console.log(`✅ Created content for section: ${contentData.section}`);
    } catch (error) {
      console.error(`❌ Error creating content for ${contentData.section}:`, error.message);
    }
  }
};

// Function to setup team
const setupTeam = async () => {
  console.log('👥 Setting up team members...');
  
  const existingTeam = await Team.countDocuments();
  if (existingTeam > 0) {
    console.log(`✅ Team members already exist (${existingTeam} members)`);
    return;
  }

  for (const memberData of sampleTeam) {
    try {
      const member = new Team(memberData);
      await member.save();
      console.log(`✅ Created team member: ${memberData.name}`);
    } catch (error) {
      console.error(`❌ Error creating team member ${memberData.name}:`, error.message);
    }
  }
};

// Function to test database connection
const testDatabaseConnection = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    console.log('🏓 Database ping successful');
    return true;
  } catch (error) {
    console.error('❌ Database ping failed:', error.message);
    return false;
  }
};

// Main setup function
const completeSetup = async () => {
  try {
    console.log('🚀 Starting complete application setup...\n');
    
    // Create necessary directories
    createDirectories();

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/linkedin-company?retryWrites=true&w=majority&appName=ZEYA-7";
    
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
      retryWrites: true
    });

    console.log('✅ Connected to MongoDB successfully!\n');

    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Database connection test failed');
    }

    // Setup admin user
    await setupAdmin();
    console.log('');

    // Setup content
    await setupContent();
    console.log('');

    // Setup team
    await setupTeam();
    console.log('');

    // Final verification
    console.log('🔍 Verifying setup...');
    const adminCount = await Admin.countDocuments();
    const contentCount = await Content.countDocuments();
    const teamCount = await Team.countDocuments();
    
    console.log(`   📊 Admin users: ${adminCount}`);
    console.log(`   📊 Content items: ${contentCount}`);
    console.log(`   📊 Team members: ${teamCount}`);

    // Create default uploads directory structure
    const uploadsPath = path.join(__dirname, '..', 'uploads', 'images');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('='.repeat(60));
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('='.repeat(60));
    console.log('🌐 URLs:');
    console.log('   Frontend: http://localhost:5001');
    console.log('   Admin Panel: http://localhost:5001/admin');
    console.log('   Backend API: http://localhost:8000');
    console.log('   Health Check: http://localhost:8000/health');
    console.log('='.repeat(60));
    console.log('⚠️  IMPORTANT: Please change the admin password after first login!');
    console.log('✨ Your application is ready to use!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify MongoDB Atlas connection string');
    console.error('   3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('   4. Check if MongoDB Atlas cluster is running');
    console.error('   5. Try running the setup again');
    process.exit(1);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Setup interrupted by user');
  try {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
  process.exit(0);
});

// Run the complete setup
if (require.main === module) {
  completeSetup();
}

module.exports = completeSetup;