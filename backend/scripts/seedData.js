const mongoose = require('mongoose');
const Content = require('../models/Content');
const Achievement = require('../models/Achievement');
const Project = require('../models/Project');
const Team = require('../models/Team');
require('dotenv').config();

const seedContent = async () => {
  const contentData = [
    {
      section: 'hero',
      title: 'Building the Future Together',
      subtitle: 'Innovation Through Excellence',
      content: 'We create innovative solutions that drive success and build lasting partnerships with our clients worldwide.',
      metadata: {
        buttonText: 'Get Started',
        buttonLink: '/contact'
      }
    },
    {
      section: 'about',
      title: 'About Our Company',
      subtitle: 'Leading the Way in Digital Innovation',
      content: 'Founded in 2019, we are a dynamic team of professionals dedicated to delivering exceptional digital solutions. Our expertise spans web development, mobile applications, and digital transformation.',
      metadata: {
        mission: 'To empower businesses through innovative technology',
        vision: 'A world where technology seamlessly enhances every business operation',
        values: 'Innovation, Integrity, Excellence, Collaboration'
      }
    }
  ];

  for (const content of contentData) {
    await Content.findOneAndUpdate(
      { section: content.section },
      content,
      { upsert: true, new: true }
    );
  }
};

const seedAchievements = async () => {
  const achievementsData = [
    {
      title: 'Best Innovation Award 2024',
      description: 'Recognized for our groundbreaking work in AI-powered business solutions.',
      date: new Date('2024-03-15'),
      category: 'award',
      featured: true
    },
    {
      title: '100+ Projects Milestone',
      description: 'Successfully completed over 100 projects for clients worldwide.',
      date: new Date('2024-01-10'),
      category: 'milestone',
      featured: true
    },
    {
      title: 'ISO 27001 Certification',
      description: 'Achieved ISO 27001 certification for information security management.',
      date: new Date('2023-11-20'),
      category: 'certification',
      featured: false
    },
    {
      title: 'Top 50 Tech Companies',
      description: 'Listed among the top 50 emerging tech companies by TechCrunch.',
      date: new Date('2023-09-05'),
      category: 'recognition',
      featured: true
    }
  ];

  for (const achievement of achievementsData) {
    await Achievement.findOneAndUpdate(
      { title: achievement.title },
      achievement,
      { upsert: true, new: true }
    );
  }
};

const seedProjects = async () => {
  const projectsData = [
    {
      title: 'E-Commerce Platform Modernization',
      description: 'Complete overhaul of legacy e-commerce system with modern React frontend and Node.js backend.',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      status: 'completed',
      progress: 100,
      technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
      category: 'Web Development',
      client: 'RetailCorp Inc.',
      budget: 75000
    },
    {
      title: 'Mobile Banking Application',
      description: 'Secure mobile banking app with biometric authentication and real-time transactions.',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-15'),
      status: 'in-progress',
      progress: 65,
      technologies: ['React Native', 'Express.js', 'PostgreSQL', 'Docker'],
      category: 'Mobile Development',
      client: 'FinanceFirst Bank',
      budget: 120000
    },
    {
      title: 'AI-Powered Analytics Dashboard',
      description: 'Advanced analytics platform with machine learning insights for business intelligence.',
      startDate: new Date('2024-05-10'),
      status: 'planning',
      progress: 15,
      technologies: ['Python', 'TensorFlow', 'React', 'FastAPI'],
      category: 'AI/ML',
      client: 'DataTech Solutions',
      budget: 95000
    }
  ];

  for (const project of projectsData) {
    await Project.findOneAndUpdate(
      { title: project.title },
      project,
      { upsert: true, new: true }
    );
  }
};

const seedTeam = async () => {
  const teamData = [
    {
      name: 'John Smith',
      position: 'CEO & Founder',
      department: 'Leadership',
      email: 'john.smith@company.com',
      bio: 'Visionary leader with 15+ years of experience in technology and business strategy.',
      skills: ['Leadership', 'Strategy', 'Business Development', 'Technology'],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/johnsmith',
        twitter: 'https://twitter.com/johnsmith'
      },
      joinDate: new Date('2019-01-01')
    },
    {
      name: 'Sarah Johnson',
      position: 'Chief Technology Officer',
      department: 'Engineering',
      email: 'sarah.johnson@company.com',
      bio: 'Tech enthusiast and full-stack developer with expertise in scalable architecture.',
      skills: ['Full-Stack Development', 'Cloud Architecture', 'DevOps', 'Team Leadership'],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        github: 'https://github.com/sarahjohnson'
      },
      joinDate: new Date('2019-02-15')
    },
    {
      name: 'Michael Brown',
      position: 'Head of Design',
      department: 'Design',
      email: 'michael.brown@company.com',
      bio: 'Creative designer passionate about user experience and visual storytelling.',
      skills: ['UI/UX Design', 'Prototyping', 'Brand Design', 'User Research'],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/michaelbrown',
        twitter: 'https://twitter.com/mikedesigns'
      },
      joinDate: new Date('2019-06-10')
    },
    {
      name: 'Emily Davis',
      position: 'Senior Full-Stack Developer',
      department: 'Engineering',
      email: 'emily.davis@company.com',
      bio: 'Passionate developer with expertise in modern web technologies and agile methodologies.',
      skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/emilydavis',
        github: 'https://github.com/emilydavis'
      },
      joinDate: new Date('2020-03-01')
    }
  ];

  for (const member of teamData) {
    await Team.findOneAndUpdate(
      { email: member.email },
      member,
      { upsert: true, new: true }
    );
  }
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Seeding content...');
    await seedContent();
    console.log('✅ Content seeded successfully');

    console.log('Seeding achievements...');
    await seedAchievements();
    console.log('✅ Achievements seeded successfully');

    console.log('Seeding projects...');
    await seedProjects();
    console.log('✅ Projects seeded successfully');

    console.log('Seeding team members...');
    await seedTeam();
    console.log('✅ Team members seeded successfully');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the script if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

// backend/utils/validators.js
const { body } = require('express-validator');

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  name: body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  phone: body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  url: (field) => body(field)
    .optional()
    .isURL()
    .withMessage(`Please provide a valid URL for ${field}`)
};

// Authentication validations
const authValidations = {
  register: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    commonValidations.email,
    commonValidations.password
  ],
  
  login: [
    commonValidations.email,
    body('password').notEmpty().withMessage('Password is required')
  ]
};

// Content validations
const contentValidations = {
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    
    body('subtitle')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Subtitle must be less than 300 characters'),
    
    body('content')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Content must be less than 5000 characters')
  ]
};

// Achievement validations
const achievementValidations = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    
    body('date')
      .isISO8601()
      .toDate()
      .withMessage('Please provide a valid date'),
    
    body('category')
      .optional()
      .isIn(['award', 'milestone', 'certification', 'recognition'])
      .withMessage('Invalid category'),
    
    body('featured')
      .optional()
      .isBoolean()
      .withMessage('Featured must be a boolean value')
  ]
};

// Project validations
const projectValidations = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 3000 })
      .withMessage('Description must be less than 3000 characters'),
    
    body('startDate')
      .isISO8601()
      .toDate()
      .withMessage('Please provide a valid start date'),
    
    body('endDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Please provide a valid end date'),
    
    body('status')
      .optional()
      .isIn(['planning', 'in-progress', 'completed', 'on-hold'])
      .withMessage('Invalid status'),
    
    body('progress')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Progress must be between 0 and 100'),
    
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Budget must be a positive number'),
    
    body('client')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Client name must be less than 200 characters'),
    
    body('category')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Category must be less than 100 characters')
  ]
};

// Team validations
const teamValidations = {
  create: [
    commonValidations.name,
    
    body('position')
      .trim()
      .notEmpty()
      .withMessage('Position is required')
      .isLength({ max: 100 })
      .withMessage('Position must be less than 100 characters'),
    
    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department must be less than 100 characters'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    commonValidations.phone,
    
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Bio must be less than 1000 characters'),
    
    body('joinDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Please provide a valid join date'),
    
    commonValidations.url('socialLinks.linkedin'),
    commonValidations.url('socialLinks.twitter'),
    commonValidations.url('socialLinks.github')
  ]
};

module.exports = {
  authValidations,
  contentValidations,
  achievementValidations,
  projectValidations,
  teamValidations,
  commonValidations
};