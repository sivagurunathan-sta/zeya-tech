const mongoose = require('mongoose');
const Project = require('../models/Project');
const path = require('path');

// Helper function to check database connection
const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Fallback project data
const getFallbackProjects = () => [
  {
    _id: '1',
    title: 'E-commerce Platform',
    description: 'Modern e-commerce solution with advanced features.',
    status: 'completed',
    category: 'Web Development',
    technologies: ['React', 'Node.js', 'MongoDB'],
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-06-01'),
    teamMembers: [],
    createdAt: new Date('2023-01-01')
  },
  {
    _id: '2',
    title: 'Mobile Banking App',
    description: 'Secure mobile banking application.',
    status: 'in-progress',
    category: 'Mobile Development',
    technologies: ['React Native', 'Node.js', 'PostgreSQL'],
    startDate: new Date('2023-07-01'),
    teamMembers: [],
    createdAt: new Date('2023-07-01')
  }
];

const getProjects = async (req, res) => {
  try {
    // Check database connection
    if (!checkDBConnection()) {
      const fallbackProjects = getFallbackProjects();
      return res.json({
        success: true,
        projects: fallbackProjects,
        totalCount: fallbackProjects.length,
        currentPage: 1,
        totalPages: 1,
        source: 'fallback'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;

    // Build filter object
    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, 'i');

    const projects = await Project.find(filter)
      .populate('teamMembers', 'name position image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        hasMore: skip + projects.length < total
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('teamMembers', 'name position image email department skills');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      projectData.images = req.files.map(file => ({
        url: `/uploads/images/${file.filename}`,
        alt: file.originalname,
        caption: req.body.caption || ''
      }));
    }

    // Handle technologies array
    if (req.body.technologies) {
      if (typeof req.body.technologies === 'string') {
        projectData.technologies = req.body.technologies.split(',').map(tech => tech.trim());
      } else if (Array.isArray(req.body.technologies)) {
        projectData.technologies = req.body.technologies;
      }
    }

    // Handle team members array
    if (req.body.teamMembers) {
      if (typeof req.body.teamMembers === 'string') {
        projectData.teamMembers = req.body.teamMembers.split(',');
      } else if (Array.isArray(req.body.teamMembers)) {
        projectData.teamMembers = req.body.teamMembers;
      }
    }

    // Convert progress to number
    if (projectData.progress) {
      projectData.progress = parseInt(projectData.progress);
    }

    // Convert budget to number
    if (projectData.budget) {
      projectData.budget = parseFloat(projectData.budget);
    }

    const project = await Project.create(projectData);
    
    // Populate team members for response
    await project.populate('teamMembers', 'name position image');
    
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => ({
        url: `/uploads/images/${file.filename}`,
        alt: file.originalname,
        caption: req.body.caption || ''
      }));
    }

    // Handle technologies array
    if (req.body.technologies) {
      if (typeof req.body.technologies === 'string') {
        updateData.technologies = req.body.technologies.split(',').map(tech => tech.trim());
      } else if (Array.isArray(req.body.technologies)) {
        updateData.technologies = req.body.technologies;
      }
    }

    // Handle team members array
    if (req.body.teamMembers) {
      if (typeof req.body.teamMembers === 'string') {
        updateData.teamMembers = req.body.teamMembers.split(',');
      } else if (Array.isArray(req.body.teamMembers)) {
        updateData.teamMembers = req.body.teamMembers;
      }
    }

    // Convert progress to number
    if (updateData.progress !== undefined) {
      updateData.progress = parseInt(updateData.progress);
    }

    // Convert budget to number
    if (updateData.budget !== undefined) {
      updateData.budget = parseFloat(updateData.budget);
    }

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('teamMembers', 'name position image');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const inProgressProjects = await Project.countDocuments({ status: 'in-progress' });
    const planningProjects = await Project.countDocuments({ status: 'planning' });
    const onHoldProjects = await Project.countDocuments({ status: 'on-hold' });

    // Calculate average progress
    const projects = await Project.find({}, 'progress');
    const totalProgress = projects.reduce((sum, project) => sum + (project.progress || 0), 0);
    const averageProgress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;

    // Get recent projects
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('teamMembers', 'name position')
      .select('title status progress createdAt');

    res.json({
      success: true,
      stats: {
        totalProjects,
        completedProjects,
        inProgressProjects,
        planningProjects,
        onHoldProjects,
        averageProgress,
        recentProjects
      }
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateProjectProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    // Auto-update status based on progress
    let status;
    if (progress === 0) status = 'planning';
    else if (progress === 100) status = 'completed';
    else status = 'in-progress';

    const project = await Project.findByIdAndUpdate(
      id,
      { progress, status },
      { new: true, runValidators: true }
    ).populate('teamMembers', 'name position image');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error('Update project progress error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  updateProjectProgress
};
