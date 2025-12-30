const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Customization key is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Key cannot be more than 50 characters']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Customization value is required']
  },
  type: {
    type: String,
    enum: ['color', 'image', 'font', 'text', 'boolean', 'number', 'object'],
    required: [true, 'Customization type is required']
  },
  category: {
    type: String,
    enum: ['theme', 'branding', 'layout', 'content', 'functionality'],
    default: 'theme'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
customizationSchema.index({ key: 1 });
customizationSchema.index({ category: 1, isActive: 1 });
customizationSchema.index({ type: 1 });

// Static method to get customization by key
customizationSchema.statics.getByKey = function(key) {
  return this.findOne({ key, isActive: true });
};

// Static method to get all customizations by category
customizationSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ order: 1 });
};

// Static method to initialize default customizations
customizationSchema.statics.initializeDefaults = async function() {
  const defaults = [
    {
      key: 'primary_color',
      value: '#3b82f6',
      type: 'color',
      category: 'theme',
      description: 'Primary brand color',
      defaultValue: '#3b82f6',
      order: 1
    },
    {
      key: 'secondary_color',
      value: '#64748b',
      type: 'color',
      category: 'theme',
      description: 'Secondary brand color',
      defaultValue: '#64748b',
      order: 2
    },
    {
      key: 'accent_color',
      value: '#8b5cf6',
      type: 'color',
      category: 'theme',
      description: 'Accent color for highlights',
      defaultValue: '#8b5cf6',
      order: 3
    },
    {
      key: 'background_color',
      value: '#ffffff',
      type: 'color',
      category: 'theme',
      description: 'Main background color',
      defaultValue: '#ffffff',
      order: 4
    },
    {
      key: 'text_color',
      value: '#1f2937',
      type: 'color',
      category: 'theme',
      description: 'Primary text color',
      defaultValue: '#1f2937',
      order: 5
    },
    {
      key: 'hero_background_image',
      value: '',
      type: 'image',
      category: 'branding',
      description: 'Hero section background image URL',
      defaultValue: '',
      order: 10
    },
    {
      key: 'logo_image',
      value: '',
      type: 'image',
      category: 'branding',
      description: 'Company logo image URL',
      defaultValue: '',
      order: 11
    },
    {
      key: 'favicon_url',
      value: '',
      type: 'image',
      category: 'branding',
      description: 'Website favicon URL',
      defaultValue: '',
      order: 12
    },
    {
      key: 'primary_font',
      value: 'Inter',
      type: 'font',
      category: 'theme',
      description: 'Primary font family',
      defaultValue: 'Inter',
      order: 20
    },
    {
      key: 'heading_font',
      value: 'Inter',
      type: 'font',
      category: 'theme',
      description: 'Heading font family',
      defaultValue: 'Inter',
      order: 21
    },
    {
      key: 'font_size_base',
      value: '16px',
      type: 'text',
      category: 'theme',
      description: 'Base font size',
      defaultValue: '16px',
      order: 22
    },
    {
      key: 'company_name',
      value: 'ZEYA-TECH',
      type: 'text',
      category: 'branding',
      description: 'Company name',
      defaultValue: 'ZEYA-TECH',
      order: 30
    },
    {
      key: 'company_tagline',
      value: 'Building the Future',
      type: 'text',
      category: 'branding',
      description: 'Company tagline',
      defaultValue: 'Building the Future',
      order: 31
    }
  ];

  for (const item of defaults) {
    await this.findOneAndUpdate(
      { key: item.key },
      item,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

module.exports = mongoose.model('Customization', customizationSchema);
