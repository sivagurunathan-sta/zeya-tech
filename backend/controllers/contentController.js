// backend/controllers/contentController.js
const mongoose = require('mongoose');
const Content = require('../models/Content');
const path = require('path');

// Helper function to check database connection
const checkDBConnection = () => {
  const state = mongoose.connection.readyState;
  console.log('Database connection state:', state);
  return state === 1; // 1 = connected
};

// Enhanced fallback content with more comprehensive data
const getFallbackContent = (section) => {
  const fallbackData = {
    hero: {
      _id: 'fallback-hero',
      section: 'hero',
      title: 'Building the Future Together',
      subtitle: 'Innovation Through Excellence',
      content: 'We create innovative solutions that drive success and build lasting partnerships with our clients worldwide. Our team is dedicated to transforming ideas into reality with cutting-edge technology and creative expertise.',
      images: [],
      metadata: new Map([
        ['buttonText', 'Get Started'],
        ['buttonLink', '/contact'],
        ['backgroundStyle', 'gradient']
      ]),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    about: {
      _id: 'fallback-about',
      section: 'about',
      title: 'About Our Company',
      subtitle: 'Excellence in Every Project',
      content: 'We are a professional technology company dedicated to delivering excellence in all our projects and services. With years of experience and a passionate team, we help businesses achieve their digital transformation goals through innovative solutions and strategic partnerships.',
      images: [],
      metadata: new Map([
        ['mission', 'To empower businesses through innovative technology'],
        ['vision', 'A world where technology seamlessly enhances every business operation'],
        ['values', 'Innovation, Integrity, Excellence, Collaboration']
      ]),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    services: {
      _id: 'fallback-services',
      section: 'services',
      title: 'Our Premium Services',
      subtitle: 'Comprehensive Solutions for Your Business',
      content: 'We offer a wide range of services including web development, mobile app development, cloud solutions, digital marketing, and IT consulting. Our experienced team works closely with clients to understand their unique needs and deliver customized solutions that drive growth and success.',
      images: [],
      metadata: new Map([
        ['highlight', 'Full-stack development expertise'],
        ['specialties', 'React, Node.js, Cloud Architecture, Mobile Apps'],
        ['approach', 'Agile methodology with continuous delivery']
      ]),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    home: {
      _id: 'fallback-home',
      section: 'home',
      title: 'Welcome to Our Digital World',
      subtitle: 'Your Success is Our Mission',
      content: 'We provide cutting-edge technology solutions to help your business grow and succeed in the digital world. From concept to deployment, our comprehensive services ensure your project exceeds expectations and delivers measurable results.',
      images: [],
      metadata: new Map([
        ['ctaText', 'Start Your Project'],
        ['ctaLink', '/contact'],
        ['features', 'Expert Team, Modern Tech Stack, 24/7 Support']
      ]),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  return fallbackData[section] || null;
};

const getContent = async (req, res) => {
  try {
    const { section } = req.params;
    console.log(`📝 Fetching content for section: ${section}`);

    // Validate section parameter
    if (!section || !['hero', 'about', 'services', 'home'].includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section parameter. Must be one of: hero, about, services, home'
      });
    }

    // Check database connection
    if (!checkDBConnection()) {
      console.log('⚠️  Database not connected, using fallback content');
      const fallbackContent = getFallbackContent(section);
      if (!fallbackContent) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }
      return res.json({ 
        success: true, 
        content: fallbackContent, 
        source: 'fallback',
        message: 'Using fallback content - database not connected'
      });
    }

    try {
      const content = await Content.findOne({ section }).lean();
      console.log(`🔍 Database query result for ${section}:`, !!content);

      if (!content) {
        console.log(`📝 No content found for ${section}, creating default`);
        // Try to create default content
        const fallbackContent = getFallbackContent(section);
        if (fallbackContent) {
          try {
            const newContent = new Content({
              section: fallbackContent.section,
              title: fallbackContent.title,
              subtitle: fallbackContent.subtitle,
              content: fallbackContent.content,
              images: fallbackContent.images || [],
              metadata: fallbackContent.metadata || new Map()
            });
            
            const savedContent = await newContent.save();
            console.log(`✅ Created default content for ${section}`);
            return res.json({ 
              success: true, 
              content: savedContent, 
              source: 'created',
              message: 'Default content created successfully'
            });
          } catch (createError) {
            console.error('❌ Error creating default content:', createError);
            // Return fallback content if creation fails
            return res.json({ 
              success: true, 
              content: fallbackContent, 
              source: 'fallback',
              message: 'Using fallback content - could not create in database'
            });
          }
        }
        return res.status(404).json({
          success: false,
          message: 'Content not found and no fallback available'
        });
      }

      // Successfully found content in database
      res.json({ 
        success: true, 
        content,
        source: 'database',
        message: 'Content retrieved successfully'
      });
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      // Return fallback on database error
      const fallbackContent = getFallbackContent(section);
      if (fallbackContent) {
        return res.json({ 
          success: true, 
          content: fallbackContent, 
          source: 'fallback',
          message: 'Using fallback content due to database error'
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('❌ Error in getContent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getAllContent = async (req, res) => {
  try {
    console.log('📋 Fetching all content');

    // Check database connection
    if (!checkDBConnection()) {
      console.log('⚠️  Database not connected, using fallback for all content');
      const fallbackContent = [
        getFallbackContent('hero'),
        getFallbackContent('about'),
        getFallbackContent('services'),
        getFallbackContent('home')
      ].filter(Boolean);
      return res.json({ 
        success: true, 
        content: fallbackContent, 
        source: 'fallback',
        message: 'Using fallback content - database not connected'
      });
    }

    try {
      const content = await Content.find().lean();
      console.log(`🔍 Database query result - found ${content.length} content items`);

      // If no content in database, create default content
      if (content.length === 0) {
        console.log('📝 No content in database, creating defaults');
        const defaultSections = ['hero', 'about', 'services', 'home'];
        const createdContent = [];

        for (const section of defaultSections) {
          const fallbackData = getFallbackContent(section);
          if (fallbackData) {
            try {
              const newContent = new Content({
                section: fallbackData.section,
                title: fallbackData.title,
                subtitle: fallbackData.subtitle,
                content: fallbackData.content,
                images: fallbackData.images || [],
                metadata: fallbackData.metadata || new Map()
              });
              
              const saved = await newContent.save();
              createdContent.push(saved);
              console.log(`✅ Created default content for ${section}`);
            } catch (createError) {
              console.error(`❌ Error creating default content for ${section}:`, createError);
              createdContent.push(fallbackData);
            }
          }
        }

        return res.json({ 
          success: true, 
          content: createdContent, 
          source: 'created',
          message: 'Default content created successfully'
        });
      }

      // Check if all required sections exist
      const existingSections = content.map(c => c.section);
      const requiredSections = ['hero', 'about', 'services', 'home'];
      const missingSections = requiredSections.filter(section => !existingSections.includes(section));

      if (missingSections.length > 0) {
        console.log(`📝 Missing sections: ${missingSections.join(', ')}, creating them`);
        for (const section of missingSections) {
          const fallbackData = getFallbackContent(section);
          if (fallbackData) {
            try {
              const newContent = new Content({
                section: fallbackData.section,
                title: fallbackData.title,
                subtitle: fallbackData.subtitle,
                content: fallbackData.content,
                images: fallbackData.images || [],
                metadata: fallbackData.metadata || new Map()
              });
              
              const saved = await newContent.save();
              content.push(saved);
              console.log(`✅ Created missing content for ${section}`);
            } catch (createError) {
              console.error(`❌ Error creating content for ${section}:`, createError);
            }
          }
        }
      }

      res.json({ 
        success: true, 
        content,
        source: 'database',
        message: 'Content retrieved successfully'
      });
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      // Return fallback on database error
      const fallbackContent = [
        getFallbackContent('hero'),
        getFallbackContent('about'),
        getFallbackContent('services'),
        getFallbackContent('home')
      ].filter(Boolean);
      return res.json({ 
        success: true, 
        content: fallbackContent, 
        source: 'fallback',
        message: 'Using fallback content due to database error'
      });
    }
  } catch (error) {
    console.error('❌ Error in getAllContent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateContent = async (req, res) => {
  try {
    const { section } = req.params;
    console.log(`📝 Updating content for section: ${section}`);

    // Validate section parameter
    if (!section || !['hero', 'about', 'services', 'home'].includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section parameter. Must be one of: hero, about, services, home'
      });
    }

    // Check database connection
    if (!checkDBConnection()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Changes cannot be saved. Please try again later.'
      });
    }

    const updateData = { 
      ...req.body, 
      section,
      updatedAt: new Date()
    };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => ({
        url: `/uploads/images/${file.filename}`,
        alt: req.body.alt || file.originalname,
        caption: req.body.caption || ''
      }));
      console.log(`📷 Added ${req.files.length} images to update`);
    }

    // Convert metadata object to Map if present
    if (req.body.metadata && typeof req.body.metadata === 'object') {
      updateData.metadata = new Map(Object.entries(req.body.metadata));
    }

    try {
      const content = await Content.findOneAndUpdate(
        { section },
        updateData,
        { 
          new: true, 
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );

      console.log(`✅ Content updated successfully for ${section}`);
      res.json({ 
        success: true, 
        content,
        message: 'Content updated successfully'
      });
    } catch (dbError) {
      console.error('❌ Database update error:', dbError);
      if (dbError.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(dbError.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('❌ Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// New function to initialize content if needed
const initializeContent = async () => {
  try {
    if (!checkDBConnection()) {
      console.log('⚠️  Cannot initialize content - database not connected');
      return false;
    }

    const existingContent = await Content.countDocuments();
    if (existingContent > 0) {
      console.log(`ℹ️  Content already exists (${existingContent} items)`);
      return true;
    }

    console.log('🚀 Initializing default content...');
    const sections = ['hero', 'about', 'services', 'home'];
    let created = 0;

    for (const section of sections) {
      const fallbackData = getFallbackContent(section);
      if (fallbackData) {
        try {
          const content = new Content({
            section: fallbackData.section,
            title: fallbackData.title,
            subtitle: fallbackData.subtitle,
            content: fallbackData.content,
            images: fallbackData.images || [],
            metadata: fallbackData.metadata || new Map()
          });
          
          await content.save();
          created++;
          console.log(`✅ Created initial content for ${section}`);
        } catch (error) {
          console.error(`❌ Error creating initial content for ${section}:`, error);
        }
      }
    }

    console.log(`🎉 Content initialization complete - created ${created} items`);
    return created > 0;
  } catch (error) {
    console.error('❌ Error initializing content:', error);
    return false;
  }
};

module.exports = {
  getContent,
  getAllContent,
  updateContent,
  initializeContent
};
