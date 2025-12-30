// Enhanced errorHandling.js - Replace your existing utils/errorHandling.js
import toast from 'react-hot-toast';

/**
 * Safely extract array data from API responses
 * @param {*} response - API response object
 * @param {string} dataPath - Path to the data in the response
 * @returns {Array} - Always returns an array
 */
export const safeArrayExtract = (response, dataPath = 'data') => {
  if (!response) {
    console.warn('No response provided to safeArrayExtract');
    return [];
  }

  const data = response.data;
  if (!data) {
    console.warn('No data field in response');
    return [];
  }

  // Try different possible response structures
  const possiblePaths = [
    data[dataPath],
    data.data,
    data.achievements,
    data.services,
    data.projects,
    data.team,
    data
  ];

  for (const path of possiblePaths) {
    if (Array.isArray(path)) {
      console.log(`Successfully extracted array with ${path.length} items from response`);
      return path;
    }
  }

  // Check if it's a single object that should be in an array
  if (data[dataPath] && typeof data[dataPath] === 'object' && !Array.isArray(data[dataPath])) {
    console.log('Converting single object to array');
    return [data[dataPath]];
  }

  console.warn('No array found in response, returning empty array');
  return [];
};

/**
 * Safely filter array with null/undefined protection
 * @param {Array} array - Array to filter
 * @param {Function} filterFn - Filter function
 * @returns {Array} - Filtered array or empty array
 */
export const safeFilter = (array, filterFn) => {
  if (!Array.isArray(array)) {
    console.warn('safeFilter: First argument is not an array');
    return [];
  }

  try {
    return array.filter(item => {
      if (!item) return false;
      try {
        return filterFn(item);
      } catch (error) {
        console.warn('Filter function error for item:', item, error);
        return false;
      }
    });
  } catch (error) {
    console.error('Error in safeFilter:', error);
    return [];
  }
};

/**
 * Safely map array with null/undefined protection
 * @param {Array} array - Array to map
 * @param {Function} mapFn - Map function
 * @returns {Array} - Mapped array or empty array
 */
export const safeMap = (array, mapFn) => {
  if (!Array.isArray(array)) {
    console.warn('safeMap: First argument is not an array');
    return [];
  }

  try {
    return array.map((item, index) => {
      if (!item) return null;
      try {
        return mapFn(item, index);
      } catch (error) {
        console.warn('Map function error for item:', item, error);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('Error in safeMap:', error);
    return [];
  }
};

/**
 * Get error message from different error formats
 * @param {*} error - Error object
 * @returns {string} - Human readable error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Unknown error occurred';

  // API error response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // API error with error field
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Standard error object
  if (error.message) {
    return error.message;
  }

  // Network errors
  if (error.code === 'NETWORK_ERROR') {
    return 'Network connection error. Please check your internet connection.';
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Rate limiting
  if (error.response?.status === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  // Authentication errors
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in.';
  }

  // Authorization errors
  if (error.response?.status === 403) {
    return 'Access denied. You don\'t have permission to perform this action.';
  }

  // Not found errors
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }

  // Server errors
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

/**
 * Validate if an object has required fields
 * @param {Object} obj - Object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - {isValid: boolean, missingFields: Array}
 */
export const validateRequiredFields = (obj, requiredFields) => {
  if (!obj || typeof obj !== 'object') {
    return { isValid: false, missingFields: requiredFields };
  }

  const missingFields = requiredFields.filter(field => {
    const value = obj[field];
    return value === null || value === undefined || value === '';
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Debounce function for preventing rapid API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with the function result
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw lastError;
      }

      // Don't retry on client errors (400-499)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Handle API errors with user-friendly toast messages
 * @param {*} error - Error object
 * @param {string} context - Context for the error (e.g., "create service")
 * @param {boolean} showToast - Whether to show a toast notification
 */
export const handleAPIError = (error, context = '', showToast = true) => {
  const message = getErrorMessage(error);
  const fullMessage = context ? `Failed to ${context}: ${message}` : message;
  
  console.error(`API Error${context ? ` (${context})` : ''}:`, error);
  
  if (showToast && error?.response?.status !== 429) { // Don't show toast for rate limiting
    toast.error(fullMessage);
  }
  
  return {
    message: fullMessage,
    status: error?.response?.status,
    code: error?.code
  };
};

/**
 * Safe JSON parse with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed object or default value
 */
export const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - {isValid: boolean, error: string}
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles = 1
  } = options;

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit` 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Create a safe async wrapper that handles errors
 * @param {Function} asyncFn - Async function to wrap
 * @param {string} context - Context for error handling
 * @returns {Function} - Wrapped function
 */
export const createSafeAsyncWrapper = (asyncFn, context = '') => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleAPIError(error, context);
      throw error;
    }
  };
};

const errorHandlingUtils = {
  safeArrayExtract,
  safeFilter,
  safeMap,
  getErrorMessage,
  validateRequiredFields,
  debounce,
  retryWithBackoff,
  handleAPIError,
  safeJsonParse,
  validateFileUpload,
  createSafeAsyncWrapper
};

export default errorHandlingUtils;