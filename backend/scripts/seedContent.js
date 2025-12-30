const mongoose = require('mongoose');
const Content = require('../models/Content');
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

const seedContent = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/?retryWrites=true&w=majority&appName=ZEYA-7";
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing content
    await Content.deleteMany({});
    console.log('🗑️  Cleared existing content');

    // Insert sample content
    for (const contentData of sampleContent) {
      try {
        const content = new Content(contentData);
        await content.save();
        console.log(`✅ Created content for section: ${contentData.section}`);
      } catch (error) {
        console.error(`❌ Error creating content for ${contentData.section}:`, error.message);
      }
    }

    console.log('🎉 Content seeding completed successfully!');
    
    // Verify the content was created
    const totalContent = await Content.countDocuments();
    console.log(`📊 Total content items in database: ${totalContent}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding content:', error);
    process.exit(1);
  }
};

// Run the seeding
seedContent();
