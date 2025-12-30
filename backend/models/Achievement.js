const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['award', 'milestone', 'certification', 'recognition'],
    default: 'milestone'
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  documents: [{
    url: String,
    name: String,
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
achievementSchema.index({ date: -1 });
achievementSchema.index({ featured: 1 });
achievementSchema.index({ category: 1 });
achievementSchema.index({ createdAt: -1 });

// Create default achievements if none exist
achievementSchema.statics.createDefaults = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        title: 'Company Founded',
        description: 'Successfully launched our company with a vision to innovate and transform the digital landscape.',
        date: new Date('2020-01-01'),
        category: 'milestone',
        featured: true,
        images: [],
        documents: []
      },
      {
        title: 'Best Innovation Award 2023',
        description: 'Received the prestigious Best Innovation Award for our groundbreaking AI solutions.',
        date: new Date('2023-01-15'),
        category: 'award',
        featured: true,
        images: [],
        documents: []
      },
      {
        title: 'ISO 27001 Certification',
        description: 'Successfully obtained ISO 27001 certification for information security management.',
        date: new Date('2023-06-10'),
        category: 'certification',
        featured: false,
        images: [],
        documents: []
      },
      {
        title: '500+ Projects Milestone',
        description: 'Reached the remarkable milestone of 500 successfully completed projects.',
        date: new Date('2024-01-01'),
        category: 'milestone',
        featured: true,
        images: [],
        documents: []
      }
    ];

    await this.insertMany(defaults);
    console.log('✅ Default achievements created');
  }
};

module.exports = mongoose.model('Achievement', achievementSchema);
