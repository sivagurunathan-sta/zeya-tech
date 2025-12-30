const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  icon: {
    type: String,
    default: 'FiCode'
  },
  features: [{
    type: String,
    trim: true
  }],
  price: {
    type: String,
    required: [true, 'Service price is required'],
    trim: true
  },
  popular: {
    type: Boolean,
    default: false
  },
  gradient: {
    type: String,
    default: 'from-blue-500 to-purple-600'
  },
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['development', 'design', 'consulting', 'security', 'optimization', 'other'],
    default: 'development'
  },
  duration: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    alt: String,
    caption: String
  }]
}, {
  timestamps: true
});

// Add index for better query performance
serviceSchema.index({ active: 1, order: 1 });
serviceSchema.index({ popular: 1 });
serviceSchema.index({ category: 1 });

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
  return this.price.includes('$') ? this.price : `$${this.price}`;
});

// Pre-save middleware to ensure only one popular service at a time
serviceSchema.pre('save', async function(next) {
  if (this.popular && this.isModified('popular')) {
    // Remove popular flag from other services
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { popular: false }
    );
  }
  next();
});

// Create default services if none exist
serviceSchema.statics.createDefaults = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultServices = [
      {
        title: 'Web Development',
        description: 'Custom web applications built with modern technologies like React, Node.js, and cloud infrastructure.',
        icon: 'FiCode',
        features: ['Responsive Design', 'SEO Optimization', 'Fast Loading', 'Secure'],
        price: 'Starting at $2,999',
        popular: true,
        gradient: 'from-blue-500 to-purple-600',
        category: 'development',
        duration: '4-8 weeks',
        tags: ['React', 'Node.js', 'MongoDB'],
        order: 1
      },
      {
        title: 'Mobile App Development',
        description: 'Native and cross-platform mobile applications for iOS and Android with seamless user experience.',
        icon: 'FiSmartphone',
        features: ['Cross-Platform', 'Native Performance', 'App Store Ready', 'Push Notifications'],
        price: 'Starting at $4,999',
        popular: false,
        gradient: 'from-green-500 to-blue-600',
        category: 'development',
        duration: '6-12 weeks',
        tags: ['React Native', 'Flutter', 'iOS', 'Android'],
        order: 2
      },
      {
        title: 'UI/UX Design',
        description: 'Beautiful, intuitive user interfaces designed to engage your users and drive conversions.',
        icon: 'FiPenTool',
        features: ['User Research', 'Wireframing', 'Prototyping', 'Design System'],
        price: 'Starting at $1,999',
        popular: false,
        gradient: 'from-pink-500 to-orange-500',
        category: 'design',
        duration: '3-6 weeks',
        tags: ['Figma', 'Adobe XD', 'Sketch'],
        order: 3
      },
      {
        title: 'Cloud Solutions',
        description: 'Scalable cloud infrastructure and deployment solutions for your applications and services.',
        icon: 'FiCloud',
        features: ['Auto Scaling', 'High Availability', 'Security', 'Monitoring'],
        price: 'Starting at $999',
        popular: false,
        gradient: 'from-cyan-500 to-blue-500',
        category: 'optimization',
        duration: '2-4 weeks',
        tags: ['AWS', 'Google Cloud', 'Azure'],
        order: 4
      },
      {
        title: 'Digital Marketing',
        description: 'Comprehensive digital marketing strategies to grow your online presence and reach.',
        icon: 'FiTrendingUp',
        features: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
        price: 'Starting at $1,499',
        popular: false,
        gradient: 'from-yellow-500 to-red-500',
        category: 'consulting',
        duration: '4-8 weeks',
        tags: ['SEO', 'Google Ads', 'Social Media'],
        order: 5
      },
      {
        title: 'Cybersecurity',
        description: 'Protect your business with comprehensive security audits, monitoring, and implementation.',
        icon: 'FiShield',
        features: ['Security Audit', 'Threat Monitoring', 'Compliance', 'Training'],
        price: 'Starting at $2,499',
        popular: false,
        gradient: 'from-red-500 to-purple-600',
        category: 'security',
        duration: '3-6 weeks',
        tags: ['Security Audit', 'Penetration Testing', 'Compliance'],
        order: 6
      }
    ];

    await this.insertMany(defaultServices);
    console.log('✅ Default services created');
  }
};

module.exports = mongoose.model('Service', serviceSchema);
