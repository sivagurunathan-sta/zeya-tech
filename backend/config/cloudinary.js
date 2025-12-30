// backend/config/cloudinary.js - Fixed version
let cloudinary;

try {
  cloudinary = require('cloudinary').v2;
  
  // Configure Cloudinary only if credentials are provided
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary configured successfully');
  } else {
    console.log('⚠️  Cloudinary not configured - environment variables missing');
  }
} catch (error) {
  console.log('⚠️  Cloudinary not available:', error.message);
  // Create a mock cloudinary object to prevent errors
  cloudinary = {
    uploader: {
      upload: async () => {
        throw new Error('Cloudinary not configured');
      },
      destroy: async () => {
        throw new Error('Cloudinary not configured');
      }
    },
    url: () => {
      throw new Error('Cloudinary not configured');
    }
  };
}

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local file path
 * @param {object} options - Upload options
 * @returns {Promise} - Cloudinary response
 */
const uploadImage = async (filePath, options = {}) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary is not configured. Using local file storage instead.');
  }

  try {
    const defaultOptions = {
      folder: 'linkedin-company',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: 'image',
      quality: 'auto',
      format: 'auto'
    };

    const uploadOptions = { ...defaultOptions, ...options };
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise} - Cloudinary response
 */
const deleteImage = async (publicId) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('Cloudinary not configured, skipping delete');
    return { result: 'ok' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

/**
 * Generate optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Image transformations
 * @returns {string} - Optimized image URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return publicId; // Return original URL if Cloudinary not configured
  }

  const defaultTransformations = {
    quality: 'auto',
    format: 'auto',
    crop: 'fill',
    gravity: 'center'
  };

  const finalTransformations = { ...defaultTransformations, ...transformations };
  
  try {
    return cloudinary.url(publicId, finalTransformations);
  } catch (error) {
    console.error('Cloudinary URL generation error:', error);
    return publicId;
  }
};

/**
 * Upload multiple images
 * @param {Array} files - Array of file paths
 * @param {object} options - Upload options
 * @returns {Promise} - Array of upload results
 */
const uploadMultipleImages = async (files, options = {}) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary is not configured. Using local file storage instead.');
  }

  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Failed to upload multiple images');
  }
};

/**
 * Generate image variants (thumbnails, different sizes)
 * @param {string} publicId - Cloudinary public ID
 * @returns {object} - Object with different image variants
 */
const generateImageVariants = (publicId) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return {
      thumbnail: publicId,
      small: publicId,
      medium: publicId,
      large: publicId,
      original: publicId
    };
  }

  return {
    thumbnail: getOptimizedUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedUrl(publicId, { width: 300, height: 300 }),
    medium: getOptimizedUrl(publicId, { width: 600, height: 400 }),
    large: getOptimizedUrl(publicId, { width: 1200, height: 800 }),
    original: getOptimizedUrl(publicId)
  };
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getOptimizedUrl,
  uploadMultipleImages,
  generateImageVariants
};