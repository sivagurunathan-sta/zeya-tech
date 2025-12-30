// backend/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    minlength: [2, 'Position must be at least 2 characters long'],
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters'],
    default: 'General'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    sparse: true, // Allows multiple documents with null/undefined email
    index: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function(skills) {
        return skills.every(skill => skill && skill.trim().length > 0);
      },
      message: 'All skills must be non-empty strings'
    }
  },
  image: {
    url: {
      type: String,
      trim: true,
      default: ''
    },
    alt: {
      type: String,
      trim: true,
      default: ''
    }
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function(url) {
          return !url || /^https?:\/\/.+/.test(url);
        },
        message: 'LinkedIn URL must be a valid URL'
      }
    },
    twitter: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function(url) {
          return !url || /^https?:\/\/.+/.test(url);
        },
        message: 'Twitter URL must be a valid URL'
      }
    },
    github: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function(url) {
          return !url || /^https?:\/\/.+/.test(url);
        },
        message: 'GitHub URL must be a valid URL'
      }
    }
  },
  joinDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Join date cannot be in the future'
    }
  },
  isLeader: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
teamSchema.index({ isActive: 1, department: 1 });
teamSchema.index({ isLeader: 1, isActive: 1 });
teamSchema.index({ isActive: 1, joinDate: -1 });
teamSchema.index({ name: 'text', position: 'text', bio: 'text' });
teamSchema.index({ skills: 1 });

// Virtual for full display name
teamSchema.virtual('displayName').get(function() {
  return `${this.name} - ${this.position}`;
});

// Virtual for years of service
teamSchema.virtual('yearsOfService').get(function() {
  if (!this.joinDate) return 0;
  const now = new Date();
  const joinYear = this.joinDate.getFullYear();
  const currentYear = now.getFullYear();
  return currentYear - joinYear;
});

// Pre-save middleware to clean up data
teamSchema.pre('save', function(next) {
  // Clean up skills array
  if (this.skills && Array.isArray(this.skills)) {
    this.skills = this.skills
      .map(skill => skill ? skill.trim() : '')
      .filter(skill => skill.length > 0)
      .filter((skill, index, arr) => arr.indexOf(skill) === index); // Remove duplicates
  }

  // Set default alt text for image if not provided
  if (this.image && this.image.url && !this.image.alt) {
    this.image.alt = `${this.name} - ${this.position}`;
  }

  // Clean up social links
  if (this.socialLinks) {
    Object.keys(this.socialLinks).forEach(platform => {
      if (this.socialLinks[platform] === '') {
        this.socialLinks[platform] = undefined;
      }
    });
  }

  next();
});

// Pre-update middleware
teamSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate();
  
  // Clean up skills if being updated
  if (update.skills && Array.isArray(update.skills)) {
    update.skills = update.skills
      .map(skill => skill ? skill.trim() : '')
      .filter(skill => skill.length > 0)
      .filter((skill, index, arr) => arr.indexOf(skill) === index);
  }

  // Set updatedAt timestamp
  update.updatedAt = new Date();
  
  next();
});

// Instance method to get social links array
teamSchema.methods.getSocialLinksArray = function() {
  const links = [];
  if (this.socialLinks) {
    Object.entries(this.socialLinks).forEach(([platform, url]) => {
      if (url && url.trim()) {
        links.push({
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          url: url.trim(),
          icon: platform // Can be used for icon mapping
        });
      }
    });
  }
  return links;
};

// Instance method to check if team member is new (joined within last 30 days)
teamSchema.methods.isNewMember = function() {
  if (!this.joinDate) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.joinDate > thirtyDaysAgo;
};

// Instance method to get formatted join date
teamSchema.methods.getFormattedJoinDate = function() {
  if (!this.joinDate) return 'Unknown';
  return this.joinDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Static method to get active team members by department
teamSchema.statics.getByDepartment = function(department) {
  return this.find({
    department: new RegExp(department, 'i'),
    isActive: true
  }).sort({ name: 1 });
};

// Static method to search team members
teamSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: new RegExp(query, 'i') },
          { position: new RegExp(query, 'i') },
          { bio: new RegExp(query, 'i') },
          { skills: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }).sort({ name: 1 });
};

// Static method to get team statistics
teamSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
      }
    }
  ]);

  const departmentStats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    overview: stats[0] || { total: 0, active: 0, inactive: 0 },
    departments: departmentStats
  };
};

// Transform JSON output
teamSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

teamSchema.set('toObject', {
  virtuals: true
});

module.exports = mongoose.model('Team', teamSchema);
