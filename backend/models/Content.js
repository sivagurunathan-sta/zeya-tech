const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    enum: ['home', 'about', 'hero', 'services']
  },
  title: String,
  subtitle: String,
  content: String,
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contentSchema.index({ section: 1 });
contentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Content', contentSchema);
