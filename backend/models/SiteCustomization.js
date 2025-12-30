const mongoose = require('mongoose');

const siteCustomizationSchema = new mongoose.Schema({
  // Logo settings
  logo: {
    url: { type: String, default: '' },
    alt: { type: String, default: 'Company Logo' },
    width: { type: Number, default: 120 },
    height: { type: Number, default: 40 }
  },
  
  // Favicon
  favicon: {
    url: { type: String, default: '' }
  },

  // Typography
  fonts: {
    primary: { 
      type: String, 
      default: 'Inter',
      enum: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Source Sans Pro']
    },
    secondary: { 
      type: String, 
      default: 'Inter',
      enum: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Source Sans Pro']
    },
    headingWeight: {
      type: String,
      default: '600',
      enum: ['300', '400', '500', '600', '700', '800', '900']
    },
    bodyWeight: {
      type: String,
      default: '400',
      enum: ['300', '400', '500', '600', '700']
    }
  },

  // Color scheme
  colors: {
    primary: { type: String, default: '#3b82f6' },
    secondary: { type: String, default: '#64748b' },
    accent: { type: String, default: '#8b5cf6' },
    background: { type: String, default: '#ffffff' },
    text: { type: String, default: '#1f2937' },
    textSecondary: { type: String, default: '#6b7280' }
  },

  // Background settings
  backgroundImage: {
    url: { type: String, default: '' },
    opacity: { type: Number, default: 0.1, min: 0, max: 1 },
    position: { 
      type: String, 
      default: 'center',
      enum: ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
    },
    size: {
      type: String,
      default: 'cover',
      enum: ['cover', 'contain', 'auto', '100%']
    },
    repeat: {
      type: String,
      default: 'no-repeat',
      enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y']
    }
  },

  // Custom CSS
  customCSS: { type: String, default: '' },

  // Social media icons/links
  socialMedia: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    github: { type: String, default: '' }
  },

  // Contact information
  contact: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' }
  },

  // SEO settings
  seo: {
    title: { type: String, default: 'ZEYA-TECH' },
    description: { type: String, default: 'Professional company website' },
    keywords: { type: String, default: 'company, business, professional' }
  },

  // Version for cache busting
  version: { type: Number, default: 1 }
}, {
  timestamps: true
});

// Ensure only one customization document exists
siteCustomizationSchema.statics.getSiteCustomization = async function() {
  let customization = await this.findOne();
  if (!customization) {
    customization = await this.create({});
  }
  return customization;
};

siteCustomizationSchema.statics.updateSiteCustomization = async function(updates) {
  let customization = await this.findOne();
  if (!customization) {
    customization = await this.create(updates);
  } else {
    Object.assign(customization, updates);
    customization.version += 1; // Increment version for cache busting
    await customization.save();
  }
  return customization;
};

module.exports = mongoose.model('SiteCustomization', siteCustomizationSchema);
