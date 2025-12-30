// Enhanced api.js service - Replace your existing services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 API ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with proper error handling
api.interceptors.response.use(
  (response) => {
    if (response.config?.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry or show toast for rate limits
    if (error.response?.status === 429) {
      console.warn('Rate limited, backing off...');
      return Promise.reject(error);
    }

    // Handle timeout with single retry for GET requests
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      if (!originalRequest._retry && originalRequest.method === 'get') {
        originalRequest._retry = true;
        try {
          return await api.request(originalRequest);
        } catch (retryError) {
          if (!originalRequest.silent) {
            toast.error('Connection timeout. Please try again.');
          }
          return Promise.reject(retryError);
        }
      }
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname.includes('admin')) {
        window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }

    // Show error message for other errors (but not for background requests)
    if (!originalRequest.silent && error.response?.status !== 429) {
      const message = error.response?.data?.message || 
                     (error.code === 'ECONNABORTED' ? 'Request timed out' : 'Network error occurred');
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Enhanced Services API with better error handling
export const servicesAPI = {
  getAll: (params = {}) => {
    console.log('🔍 ServicesAPI.getAll called with params:', params);
    return api.get('/services', { 
      params, 
      silent: true // Don't show error toasts for background requests
    });
  },

  getById: (id) => {
    console.log('🔍 ServicesAPI.getById called with id:', id);
    return api.get(`/services/${id}`);
  },

  create: (data) => {
    console.log('🔨 ServicesAPI.create called with data:', data);
    
    let formData;
    
    if (data instanceof FormData) {
      formData = data;
      console.log('Using provided FormData');
    } else {
      console.log('Converting object to FormData');
      formData = new FormData();
      
      // Handle regular fields
      Object.keys(data).forEach(key => {
        if (key !== 'images' && data[key] !== null && data[key] !== undefined) {
          if (Array.isArray(data[key])) {
            // Handle arrays (features, tags, etc.)
            data[key].forEach((item, index) => {
              if (item && item.trim && item.trim()) {
                formData.append(`${key}[${index}]`, item.trim());
              }
            });
          } else {
            formData.append(key, String(data[key]));
          }
        }
      });
      
      // Handle images separately
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }
    }

    // Debug FormData contents in development
    if (process.env.NODE_ENV === 'development') {
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
    }
    
    return api.post('/services', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout for file uploads
    });
  },

  update: (id, data) => {
    console.log('🔧 ServicesAPI.update called with id:', id, 'data:', data);
    
    if (!id) {
      throw new Error('Service ID is required for update');
    }

    let formData;
    
    if (data instanceof FormData) {
      formData = data;
      console.log('Using provided FormData for update');
    } else {
      console.log('Converting object to FormData for update');
      formData = new FormData();
      
      // Handle regular fields
      Object.keys(data).forEach(key => {
        if (key !== 'images' && data[key] !== null && data[key] !== undefined) {
          if (Array.isArray(data[key])) {
            // Handle arrays (features, tags, etc.)
            data[key].forEach((item, index) => {
              if (item && item.trim && item.trim()) {
                formData.append(`${key}[${index}]`, item.trim());
              }
            });
          } else {
            formData.append(key, String(data[key]));
          }
        }
      });
      
      // Handle images separately
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }
    }

    // Debug FormData contents in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Update FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
    }
    
    return api.put(`/services/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout for file uploads
    });
  },

  delete: (id) => {
    console.log('🗑️ ServicesAPI.delete called with id:', id);
    if (!id) {
      throw new Error('Service ID is required for deletion');
    }
    return api.delete(`/services/${id}`);
  },

  toggleStatus: (id) => {
    console.log('🔄 ServicesAPI.toggleStatus called with id:', id);
    if (!id) {
      throw new Error('Service ID is required for status toggle');
    }
    return api.patch(`/services/${id}/toggle`);
  },
};

// Achievement API
export const achievementAPI = {
  getAll: (params = {}) => api.get('/achievements', { params }),
  create: (data) => {
    console.log('🏆 AchievementAPI.create called with data:', data);

    let formData;

    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();

      // Handle regular fields
      Object.keys(data).forEach(key => {
        if (key !== 'images' && data[key] !== null && data[key] !== undefined) {
          formData.append(key, String(data[key]));
        }
      });

      // Handle all files under 'images' field
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append('images', file);
        });
      }
    }

    return api.post('/achievements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  update: (id, data) => {
    console.log('🔧 AchievementAPI.update called with id:', id, 'data:', data);

    let formData;

    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();

      // Handle regular fields
      Object.keys(data).forEach(key => {
        if (key !== 'images' && data[key] !== null && data[key] !== undefined) {
          formData.append(key, String(data[key]));
        }
      });

      // Handle all files under 'images' field
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append('images', file);
        });
      }
    }

    return api.put(`/achievements/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  delete: (id) => api.delete(`/achievements/${id}`),
};

// Content API
export const contentAPI = {
  getAll: () => api.get('/content'),
  getBySection: (section) => api.get(`/content/${section}`),
  update: (section, data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key !== 'images' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    if (data.images && data.images.length > 0) {
      data.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return api.put(`/content/${section}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Project API
export const projectAPI = {
  getAll: () => api.get('/projects'),
  create: (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key !== 'images' && data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => {
            formData.append(`${key}[]`, item);
          });
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    
    if (data.images && data.images.length > 0) {
      data.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key !== 'images' && data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => {
            formData.append(`${key}[]`, item);
          });
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    
    if (data.images && data.images.length > 0) {
      data.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return api.put(`/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/projects/${id}`),
};

// Team API
export const teamAPI = {
  getAll: () => api.get('/team'),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/team', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'socialLinks' && typeof data[key] === 'object') {
        Object.keys(data[key]).forEach(socialKey => {
          if (data[key][socialKey]) {
            formData.append(`socialLinks[${socialKey}]`, data[key][socialKey]);
          }
        });
      } else if (key !== 'image' && data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => {
            formData.append(`${key}[]`, item);
          });
        } else {
          const value = typeof data[key] === 'boolean' ? String(data[key]) : data[key];
          formData.append(key, value);
        }
      }
    });

    if (data.image) {
      formData.append('image', data.image);
    }

    return api.post('/team', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/team/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'socialLinks' && typeof data[key] === 'object') {
        Object.keys(data[key]).forEach(socialKey => {
          if (data[key][socialKey]) {
            formData.append(`socialLinks[${socialKey}]`, data[key][socialKey]);
          }
        });
      } else if (key !== 'image' && data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => {
            formData.append(`${key}[]`, item);
          });
        } else {
          const value = typeof data[key] === 'boolean' ? String(data[key]) : data[key];
          formData.append(key, value);
        }
      }
    });

    if (data.image) {
      formData.append('image', data.image);
    }

    return api.put(`/team/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/team/${id}`),
};

// Contact API
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: (params = {}) => api.get('/contact', { params }),
  updateStatus: (id, status) => api.put(`/contact/${id}/status`, { status }),
};

// Enhanced image URL handling
export const getAssetUrl = (relativePath) => {
  if (!relativePath) return '';
  
  if (process.env.NODE_ENV === 'development') {
    console.log('getAssetUrl input:', relativePath);
  }
  
  try {
    // If it's already a full URL, return as is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // If it's a data URL (base64), return as is
    if (relativePath.startsWith('data:')) {
      return relativePath;
    }
    
    // Handle different path formats
    let cleanPath = relativePath;
    
    // Remove leading slash if present
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // In development, avoid absolute localhost which isn't accessible from remote preview.
    // Use relative paths so CRA proxy forwards to backend.
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL) {
      const finalUrl = `/${cleanPath}`;
      console.log('getAssetUrl output:', finalUrl);
      return finalUrl;
    }

    // Build the full URL (production or explicit API URL in dev)
    let baseUrl = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_API_URL : window.location.origin;

    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    // Construct final URL
    const finalUrl = `${baseUrl ? baseUrl : ''}/${cleanPath}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('getAssetUrl output:', finalUrl);
    }

    return finalUrl;
    
  } catch (error) {
    console.error('Error in getAssetUrl:', error);
    return relativePath;
  }
};

// Test API connection utility
export const testAPIConnection = async () => {
  try {
    const response = await api.get('/health', { silent: true });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Default export
export default api;
