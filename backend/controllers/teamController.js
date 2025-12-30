// backend/controllers/teamController.js
const mongoose = require('mongoose');
const Team = require('../models/Team');
const path = require('path');
const fs = require('fs').promises;

// Helper function to check database connection
const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Enhanced fallback team data
const getFallbackTeam = () => [
  {
    _id: 'fallback-1',
    name: 'John Smith',
    position: 'CEO & Founder',
    department: 'Leadership',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    bio: 'Visionary leader with 15+ years of experience in technology and business strategy. Passionate about building innovative solutions that make a real difference.',
    skills: ['Leadership', 'Strategy', 'Business Development', 'Technology Vision'],
    image: {
      url: '/uploads/images/default-avatar-1.jpg',
      alt: 'John Smith - CEO'
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johnsmith',
      twitter: 'https://twitter.com/johnsmith',
      github: ''
    },
    joinDate: new Date('2020-01-01'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'fallback-2',
    name: 'Sarah Johnson',
    position: 'Chief Technology Officer',
    department: 'Engineering',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4568',
    bio: 'Tech enthusiast and full-stack developer with expertise in scalable architecture and team leadership. Drives technical excellence across all projects.',
    skills: ['Full-Stack Development', 'Cloud Architecture', 'DevOps', 'Team Leadership', 'System Design'],
    image: {
      url: '/uploads/images/default-avatar-2.jpg',
      alt: 'Sarah Johnson - CTO'
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: '',
      github: 'https://github.com/sarahjohnson'
    },
    joinDate: new Date('2020-03-15'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'fallback-3',
    name: 'Michael Brown',
    position: 'Head of Design',
    department: 'Design',
    email: 'michael.brown@company.com',
    phone: '+1 (555) 123-4569',
    bio: 'Creative designer passionate about user experience and visual storytelling. Creates beautiful, functional designs that users love.',
    skills: ['UI/UX Design', 'Prototyping', 'Brand Design', 'User Research', 'Design Systems'],
    image: {
      url: '/uploads/images/default-avatar-3.jpg',
      alt: 'Michael Brown - Head of Design'
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/michaelbrown',
      twitter: 'https://twitter.com/mikedesigns',
      github: ''
    },
    joinDate: new Date('2020-06-10'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Enhanced validation function
const validateTeamMemberData = (data, isUpdate = false) => {
  const errors = [];
  
  // Required fields for creation
  if (!isUpdate) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name is required' });
    }
    if (!data.position || data.position.trim().length === 0) {
      errors.push({ field: 'position', message: 'Position is required' });
    }
  }
  
  // Optional but validated fields
  if (data.name && (data.name.length < 2 || data.name.length > 100)) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters' });
  }
  
  if (data.position && (data.position.length < 2 || data.position.length > 100)) {
    errors.push({ field: 'position', message: 'Position must be between 2 and 100 characters' });
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }
  
  if (data.phone && !/^[\+]?[1-9][\d\s\-\(\)]{7,15}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.push({ field: 'phone', message: 'Please provide a valid phone number' });
  }
  
  if (data.bio && data.bio.length > 1000) {
    errors.push({ field: 'bio', message: 'Bio must be less than 1000 characters' });
  }
  
  // Validate social links if provided
  const urlPattern = /^https?:\/\/.+/;
  if (data['socialLinks[linkedin]'] && !urlPattern.test(data['socialLinks[linkedin]'])) {
    errors.push({ field: 'socialLinks.linkedin', message: 'LinkedIn URL must be a valid URL' });
  }
  if (data['socialLinks[twitter]'] && !urlPattern.test(data['socialLinks[twitter]'])) {
    errors.push({ field: 'socialLinks.twitter', message: 'Twitter URL must be a valid URL' });
  }
  if (data['socialLinks[github]'] && !urlPattern.test(data['socialLinks[github]'])) {
    errors.push({ field: 'socialLinks.github', message: 'GitHub URL must be a valid URL' });
  }
  
  return errors;
};

const getTeamMembers = async (req, res) => {
  try {
    console.log('👥 Fetching team members');
    
    // Check database connection
    if (!checkDBConnection()) {
      const fallbackTeam = getFallbackTeam();
      return res.json({
        success: true,
        team: fallbackTeam,
        pagination: {
          page: 1,
          pages: 1,
          total: fallbackTeam.length,
          hasMore: false
        },
        source: 'fallback',
        message: 'Using fallback data - database not connected'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const department = req.query.department;
    const active = req.query.active;

    // Build filter object
    let filter = {};
    if (department) filter.department = new RegExp(department, 'i');
    if (active !== undefined) filter.isActive = active === 'true';

    try {
      const team = await Team.find(filter)
        .sort({ joinDate: -1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Team.countDocuments(filter);

      // If no team members exist, create some default ones
      if (total === 0) {
        console.log('👥 No team members found, creating defaults...');
        const fallbackTeam = getFallbackTeam();
        const createdMembers = [];
        
        for (const memberData of fallbackTeam) {
          try {
            const member = new Team({
              name: memberData.name,
              position: memberData.position,
              department: memberData.department,
              email: memberData.email,
              phone: memberData.phone,
              bio: memberData.bio,
              skills: memberData.skills,
              image: memberData.image,
              socialLinks: memberData.socialLinks,
              joinDate: memberData.joinDate,
              isActive: memberData.isActive
            });
            
            const savedMember = await member.save();
            createdMembers.push(savedMember);
            console.log(`✅ Created team member: ${memberData.name}`);
          } catch (createError) {
            console.error(`❌ Error creating team member ${memberData.name}:`, createError);
          }
        }
        
        return res.json({
          success: true,
          team: createdMembers,
          pagination: {
            page: 1,
            pages: 1,
            total: createdMembers.length,
            hasMore: false
          },
          source: 'created',
          message: 'Default team members created successfully'
        });
      }

      res.json({
        success: true,
        team,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          hasMore: skip + team.length < total
        },
        source: 'database'
      });
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      const fallbackTeam = getFallbackTeam();
      return res.json({
        success: true,
        team: fallbackTeam,
        pagination: {
          page: 1,
          pages: 1,
          total: fallbackTeam.length,
          hasMore: false
        },
        source: 'fallback',
        message: 'Using fallback data due to database error'
      });
    }
  } catch (error) {
    console.error('❌ Get team members error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while fetching team members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👤 Fetching team member: ${id}`);
    
    if (!checkDBConnection()) {
      const fallbackTeam = getFallbackTeam();
      const member = fallbackTeam.find(m => m._id === id);
      if (!member) {
        return res.status(404).json({ 
          success: false, 
          message: 'Team member not found' 
        });
      }
      return res.json({ 
        success: true, 
        teamMember: member, 
        source: 'fallback' 
      });
    }

    const teamMember = await Team.findById(id).lean();

    if (!teamMember) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team member not found' 
      });
    }

    res.json({ success: true, teamMember });
  } catch (error) {
    console.error('❌ Get team member by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while fetching team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createTeamMember = async (req, res) => {
  try {
    console.log('👤 Creating new team member');
    console.log('Request body:', req.body);
    
    if (!checkDBConnection()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot create team member.'
      });
    }

    // Validate input data
    const validationErrors = validateTeamMemberData(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const teamData = { 
      name: req.body.name.trim(),
      position: req.body.position.trim(),
      department: req.body.department?.trim() || 'General',
      email: req.body.email?.trim().toLowerCase() || '',
      phone: req.body.phone?.trim() || '',
      bio: req.body.bio?.trim() || '',
      isActive: req.body.isActive !== undefined ? toBool(req.body.isActive) : true,
      isLeader: req.body.isLeader !== undefined ? toBool(req.body.isLeader) : false,
      joinDate: req.body.joinDate ? new Date(req.body.joinDate) : new Date()
    };

    // Handle image upload
    if (req.file) {
      teamData.image = {
        url: `/uploads/images/${req.file.filename}`,
        alt: `${teamData.name} - ${teamData.position}`
      };
      console.log('📷 Image uploaded:', teamData.image.url);
    }

    // Handle skills array
    if (req.body.skills) {
      if (typeof req.body.skills === 'string') {
        teamData.skills = req.body.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      } else if (Array.isArray(req.body.skills)) {
        teamData.skills = req.body.skills.filter(skill => skill && skill.trim().length > 0);
      }
    } else {
      teamData.skills = [];
    }

    // Handle social links
    teamData.socialLinks = {
      linkedin: req.body['socialLinks[linkedin]']?.trim() || '',
      twitter: req.body['socialLinks[twitter]']?.trim() || '',
      github: req.body['socialLinks[github]']?.trim() || ''
    };

    console.log('Final team data:', teamData);

    try {
      const teamMember = new Team(teamData);
      const savedMember = await teamMember.save();
      console.log('✅ Team member created successfully:', savedMember._id);
      
      res.status(201).json({ 
        success: true, 
        teamMember: savedMember,
        message: 'Team member created successfully'
      });
    } catch (saveError) {
      console.error('❌ Error saving team member:', saveError);
      
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }
      
      if (saveError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Team member with this email already exists'
        });
      }
      
      throw saveError;
    }
  } catch (error) {
    console.error('❌ Create team member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while creating team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Robust boolean parser to handle various truthy forms coming from multipart/form-data
const toBool = (v) => v === true || v === 'true' || v === '1' || v === 'on' || v === 'yes';

const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👤 Updating team member: ${id}`);
    console.log('Request body:', req.body);
    
    if (!checkDBConnection()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot update team member.'
      });
    }

    // Validate input data for update
    const validationErrors = validateTeamMemberData(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Get existing team member first
    const existingMember = await Team.findById(id);
    if (!existingMember) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team member not found' 
      });
    }

    const updateData = {};
    
    // Only update provided fields
    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.position !== undefined) updateData.position = req.body.position.trim();
    if (req.body.department !== undefined) updateData.department = req.body.department.trim();
    if (req.body.email !== undefined) updateData.email = req.body.email.trim().toLowerCase();
    if (req.body.phone !== undefined) updateData.phone = req.body.phone.trim();
    if (req.body.bio !== undefined) updateData.bio = req.body.bio.trim();
    if (req.body.joinDate !== undefined) updateData.joinDate = new Date(req.body.joinDate);
    if (req.body.isActive !== undefined) {
      updateData.isActive = toBool(req.body.isActive);
    }
    if (req.body.isLeader !== undefined) {
      updateData.isLeader = toBool(req.body.isLeader);
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (existingMember.image && existingMember.image.url) {
        const oldImagePath = path.join(__dirname, '..', existingMember.image.url);
        try {
          await fs.unlink(oldImagePath);
          console.log('🗑️ Deleted old image:', existingMember.image.url);
        } catch (err) {
          console.log('⚠️ Could not delete old image:', err.message);
        }
      }

      updateData.image = {
        url: `/uploads/images/${req.file.filename}`,
        alt: `${updateData.name || existingMember.name} - ${updateData.position || existingMember.position}`
      };
      console.log('📷 New image uploaded:', updateData.image.url);
    }

    // Handle skills array
    if (req.body.skills !== undefined) {
      if (typeof req.body.skills === 'string') {
        updateData.skills = req.body.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      } else if (Array.isArray(req.body.skills)) {
        updateData.skills = req.body.skills.filter(skill => skill && skill.trim().length > 0);
      } else {
        updateData.skills = [];
      }
    }

    // Handle social links
    if (req.body['socialLinks[linkedin]'] !== undefined || 
        req.body['socialLinks[twitter]'] !== undefined || 
        req.body['socialLinks[github]'] !== undefined) {
      updateData.socialLinks = {
        linkedin: req.body['socialLinks[linkedin]']?.trim() || existingMember.socialLinks?.linkedin || '',
        twitter: req.body['socialLinks[twitter]']?.trim() || existingMember.socialLinks?.twitter || '',
        github: req.body['socialLinks[github]']?.trim() || existingMember.socialLinks?.github || ''
      };
    }

    updateData.updatedAt = new Date();

    console.log('Update data:', updateData);

    try {
      const teamMember = await Team.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });

      console.log('✅ Team member updated successfully');
      res.json({ 
        success: true, 
        teamMember,
        message: 'Team member updated successfully'
      });
    } catch (updateError) {
      console.error('❌ Error updating team member:', updateError);
      
      if (updateError.name === 'ValidationError') {
        const errors = Object.values(updateError.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }
      
      if (updateError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Team member with this email already exists'
        });
      }
      
      throw updateError;
    }
  } catch (error) {
    console.error('❌ Update team member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while updating team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Soft deleting team member: ${id}`);
    
    if (!checkDBConnection()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot delete team member.'
      });
    }

    // Soft delete (set isActive to false)
    const teamMember = await Team.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!teamMember) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team member not found' 
      });
    }

    console.log('✅ Team member soft deleted successfully');
    res.json({ 
      success: true, 
      message: 'Team member deactivated successfully',
      teamMember
    });
  } catch (error) {
    console.error('❌ Delete team member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while deleting team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const hardDeleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Hard deleting team member: ${id}`);
    
    if (!checkDBConnection()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Cannot delete team member.'
      });
    }

    const teamMember = await Team.findById(id);

    if (!teamMember) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team member not found' 
      });
    }

    // Delete associated image file
    if (teamMember.image && teamMember.image.url) {
      const imagePath = path.join(__dirname, '..', teamMember.image.url);
      try {
        await fs.unlink(imagePath);
        console.log('🗑️ Deleted image file:', teamMember.image.url);
      } catch (err) {
        console.log('⚠️ Could not delete image file:', err.message);
      }
    }

    await Team.findByIdAndDelete(id);
    console.log('✅ Team member permanently deleted');
    res.json({ 
      success: true, 
      message: 'Team member permanently deleted' 
    });
  } catch (error) {
    console.error('❌ Hard delete team member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while deleting team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTeamStats = async (req, res) => {
  try {
    console.log('📊 Fetching team statistics');
    
    if (!checkDBConnection()) {
      const fallbackTeam = getFallbackTeam();
      return res.json({
        success: true,
        stats: {
          totalMembers: fallbackTeam.length,
          activeMembers: fallbackTeam.filter(m => m.isActive).length,
          inactiveMembers: fallbackTeam.filter(m => !m.isActive).length,
          departmentStats: [
            { _id: 'Leadership', count: 1 },
            { _id: 'Engineering', count: 1 },
            { _id: 'Design', count: 1 }
          ],
          recentJoiners: fallbackTeam.slice(0, 3),
          skillsStats: [
            { _id: 'Leadership', count: 2 },
            { _id: 'Development', count: 2 },
            { _id: 'Design', count: 1 }
          ]
        },
        source: 'fallback'
      });
    }

    try {
      const totalMembers = await Team.countDocuments();
      const activeMembers = await Team.countDocuments({ isActive: true });
      const inactiveMembers = await Team.countDocuments({ isActive: false });

      // Get department breakdown
      const departmentStats = await Team.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get recent joiners
      const recentJoiners = await Team.find({ isActive: true })
        .sort({ joinDate: -1 })
        .limit(5)
        .select('name position department joinDate image')
        .lean();

      // Get skills distribution
      const skillsStats = await Team.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        success: true,
        stats: {
          totalMembers,
          activeMembers,
          inactiveMembers,
          departmentStats,
          recentJoiners,
          skillsStats
        },
        source: 'database'
      });
    } catch (dbError) {
      console.error('❌ Database stats error:', dbError);
      const fallbackTeam = getFallbackTeam();
      return res.json({
        success: true,
        stats: {
          totalMembers: fallbackTeam.length,
          activeMembers: fallbackTeam.filter(m => m.isActive).length,
          inactiveMembers: fallbackTeam.filter(m => !m.isActive).length,
          departmentStats: [
            { _id: 'Leadership', count: 1 },
            { _id: 'Engineering', count: 1 },
            { _id: 'Design', count: 1 }
          ],
          recentJoiners: fallbackTeam.slice(0, 3),
          skillsStats: [
            { _id: 'Leadership', count: 2 },
            { _id: 'Development', count: 2 },
            { _id: 'Design', count: 1 }
          ]
        },
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('❌ Get team stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while fetching team stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getDepartments = async (req, res) => {
  try {
    console.log('🏢 Fetching departments');
    
    if (!checkDBConnection()) {
      return res.json({
        success: true,
        departments: [
          { name: 'Leadership', count: 1 },
          { name: 'Engineering', count: 1 },
          { name: 'Design', count: 1 }
        ],
        source: 'fallback'
      });
    }

    try {
      const departments = await Team.distinct('department', { isActive: true });
      const departmentsWithCounts = await Promise.all(
        departments.map(async (dept) => {
          const count = await Team.countDocuments({ 
            department: dept, 
            isActive: true 
          });
          return { name: dept, count };
        })
      );

      res.json({
        success: true,
        departments: departmentsWithCounts.sort((a, b) => b.count - a.count),
        source: 'database'
      });
    } catch (dbError) {
      console.error('❌ Database departments error:', dbError);
      return res.json({
        success: true,
        departments: [
          { name: 'Leadership', count: 1 },
          { name: 'Engineering', count: 1 },
          { name: 'Design', count: 1 }
        ],
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('❌ Get departments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while fetching departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const searchTeamMembers = async (req, res) => {
  try {
    const { q, department, skills } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log(`🔍 Searching team members with query: ${q}`);

    if (!checkDBConnection()) {
      const fallbackTeam = getFallbackTeam();
      let filteredTeam = fallbackTeam.filter(member => member.isActive);
      
      if (q) {
        const query = q.toLowerCase();
        filteredTeam = filteredTeam.filter(member => 
          member.name.toLowerCase().includes(query) ||
          member.position.toLowerCase().includes(query) ||
          member.bio.toLowerCase().includes(query)
        );
      }
      
      return res.json({
        success: true,
        team: filteredTeam.slice(skip, skip + limit),
        pagination: {
          page,
          pages: Math.ceil(filteredTeam.length / limit),
          total: filteredTeam.length
        },
        source: 'fallback'
      });
    }

    let filter = { isActive: true };

    // Text search
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { position: new RegExp(q, 'i') },
        { bio: new RegExp(q, 'i') }
      ];
    }

    // Department filter
    if (department) {
      filter.department = new RegExp(department, 'i');
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filter.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    try {
      const team = await Team.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .select('name position department image skills bio')
        .lean();

      const total = await Team.countDocuments(filter);

      res.json({
        success: true,
        team,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total
        },
        source: 'database'
      });
    } catch (dbError) {
      console.error('❌ Database search error:', dbError);
      return res.json({
        success: true,
        team: [],
        pagination: {
          page: 1,
          pages: 0,
          total: 0
        },
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('❌ Search team members error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while searching team members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  hardDeleteTeamMember,
  getTeamStats,
  getDepartments,
  searchTeamMembers
};
