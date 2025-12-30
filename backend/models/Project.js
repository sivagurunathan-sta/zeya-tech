const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  technologies: [String],
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  category: String,
  budget: Number,
  client: String
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: -1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ category: 1 });

module.exports = mongoose.model('Project', projectSchema);
