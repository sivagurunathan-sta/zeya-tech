export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  
  // Content
  CONTENT: '/content',
  
  // Achievements
  ACHIEVEMENTS: '/achievements',
  
  // Projects
  PROJECTS: '/projects',
  
  // Team
  TEAM: '/team',
  
  // Contact
  CONTACT: '/contact'
};

export const QUERY_KEYS = {
  ACHIEVEMENTS: 'achievements',
  PROJECTS: 'projects',
  TEAM: 'teamMembers',
  CONTENT: 'content',
  CONTACTS: 'contacts',
  USER: 'user'
};

export const ACHIEVEMENT_CATEGORIES = [
  { value: 'award', label: 'Award', icon: '🏆' },
  { value: 'milestone', label: 'Milestone', icon: '🎯' },
  { value: 'certification', label: 'Certification', icon: '📜' },
  { value: 'recognition', label: 'Recognition', icon: '⭐' }
];

export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'on-hold', label: 'On Hold', color: 'red' }
];

export const QUERY_TYPES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'project', label: 'Project Discussion' },
  { value: 'career', label: 'Career Opportunities' },
  { value: 'partnership', label: 'Partnership' }
];

export const URGENCY_LEVELS = [
  { value: 'low', label: 'Low Priority', color: 'gray' },
  { value: 'medium', label: 'Medium Priority', color: 'blue' },
  { value: 'high', label: 'High Priority', color: 'red' }
];

export const SOCIAL_LINKS = {
  LINKEDIN: 'https://linkedin.com/company/your-company',
  TWITTER: 'https://twitter.com/yourcompany',
  FACEBOOK: 'https://facebook.com/yourcompany',
  INSTAGRAM: 'https://instagram.com/yourcompany',
  GITHUB: 'https://github.com/yourcompany'
};

export const CONTACT_INFO = {
  EMAIL: 'hello@linkedincompany.com',
  PHONE: '+1 (555) 123-4567',
  ADDRESS: '123 Business Street, City, State 12345',
  HOURS: 'Monday - Friday, 8:00 AM - 6:00 PM EST'
};

export const COMPANY_INFO = {
  NAME: 'ZEYA-TECH',
  TAGLINE: 'Building the Future Together',
  DESCRIPTION: 'We create innovative solutions that drive success and build lasting partnerships with our clients worldwide.',
  FOUNDED: '2019',
  EMPLOYEES: '50+',
  PROJECTS: '150+',
  CLIENT_SATISFACTION: '98%'
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 5
};

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};
