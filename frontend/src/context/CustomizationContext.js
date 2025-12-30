import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';

const CustomizationContext = createContext();

const defaultCustomization = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    background: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280'
  },
  fonts: {
    primary: 'Inter',
    secondary: 'Inter',
    headingWeight: '600',
    bodyWeight: '400'
  },
  logo: {
    url: null,
    width: 120,
    height: 40
  },
  favicon: {
    url: null
  },
  backgroundImage: {
    url: null,
    opacity: 0.1,
    position: 'center',
    size: 'cover',
    repeat: 'no-repeat'
  },
  seo: {
    title: 'ZEYA-TECH',
    description: 'Professional company website',
    keywords: ''
  },
  socialMedia: {
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    youtube: '',
    github: ''
  },
  contact: {
    phone: '',
    email: '',
    address: ''
  }
};

export const CustomizationProvider = ({ children }) => {
  const [customization, setCustomization] = useState(defaultCustomization);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch customization data with better error handling
    const { isLoading, error } = useQuery(
    'siteCustomization',
    async () => {
      try {
        const response = await api.get('/customizations', { silent: true });
        return response.data.data;
      } catch (error) {
        if (error.response?.status === 404) {
          // No customization found, use defaults
          return null;
        }
        throw error;
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: (failureCount, error) => {
        // Don't retry on 404 or rate limiting
        if (error?.response?.status === 404 || error?.response?.status === 429) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onSuccess: (data) => {
        if (data) {
          const mergedCustomization = mergeWithDefaults(data);
          setCustomization(mergedCustomization);
        } else {
          setCustomization(defaultCustomization);
        }
        setIsLoaded(true);
      },
      onError: (error) => {
        console.warn('Failed to load customization:', error?.response?.status || error.message);
        setCustomization(defaultCustomization);
        setIsLoaded(true);
      }
    }
  );

  // Helper function to merge with defaults
  const mergeWithDefaults = (data) => {
    return {
      ...defaultCustomization,
      ...data,
      colors: { ...defaultCustomization.colors, ...data.colors },
      fonts: { ...defaultCustomization.fonts, ...data.fonts },
      logo: { ...defaultCustomization.logo, ...data.logo },
      favicon: { ...defaultCustomization.favicon, ...data.favicon },
      backgroundImage: { ...defaultCustomization.backgroundImage, ...data.backgroundImage },
      seo: { ...defaultCustomization.seo, ...data.seo },
      socialMedia: { ...defaultCustomization.socialMedia, ...data.socialMedia },
      contact: { ...defaultCustomization.contact, ...data.contact }
    };
  };

  // Apply customization to document
  const applyCustomizationToDocument = React.useCallback((customization) => {
    try {
      const root = document.documentElement;
      // Apply CSS custom properties for colors
      Object.entries(customization.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      // Apply fonts
      Object.entries(customization.fonts).forEach(([key, value]) => {
        root.style.setProperty(`--font-${key}`, value);
      });
      // Apply background image if present
      if (customization.backgroundImage?.url) {
        root.style.setProperty('--bg-image-url', `url(${customization.backgroundImage.url})`);
        root.style.setProperty('--bg-image-opacity', customization.backgroundImage.opacity);
        root.style.setProperty('--bg-image-position', customization.backgroundImage.position);
        root.style.setProperty('--bg-image-size', customization.backgroundImage.size);
        root.style.setProperty('--bg-image-repeat', customization.backgroundImage.repeat);
      }
      // Update document title
      if (customization.seo?.title) {
        document.title = customization.seo.title;
      }
      // Update meta tags
      updateMetaTag('description', customization.seo?.description || '');
      updateMetaTag('keywords', customization.seo?.keywords || '');
      // Update favicon
      if (customization.favicon?.url) {
        updateFavicon(customization.favicon.url);
      }
    } catch (error) {
      console.error('Error applying customization:', error);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && customization) {
      applyCustomizationToDocument(customization);
    }
  }, [customization, isLoaded, applyCustomizationToDocument]);

  const updateMetaTag = (name, content) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  const updateFavicon = (url) => {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', url);
  };

  // Function to refresh customization data
  const refreshCustomization = async () => {
    try {
      const response = await api.get('/customizations', { silent: true });
      const newData = response.data.data;
      if (newData) {
        const mergedCustomization = mergeWithDefaults(newData);
        setCustomization(mergedCustomization);
      }
    } catch (error) {
      if (error?.response?.status === 429) {
        console.warn('Rate limited during refresh, keeping current customization');
      } else {
        console.error('Failed to refresh customization:', error);
        throw error;
      }
    }
  };

  const value = {
    customization,
    isLoading,
    isLoaded,
    error,
    refreshCustomization,
    // Helper functions for easy access to common values
    getColor: (key) => {
      const color = customization?.colors?.[key] || defaultCustomization.colors[key];
      return color || '#3b82f6'; // fallback color
    },
    getFont: (key) => customization?.fonts?.[key] || defaultCustomization.fonts[key],
    getLogo: () => customization?.logo || defaultCustomization.logo,
    getSocialMedia: (key) => customization?.socialMedia?.[key] || '',
    getContact: (key) => customization?.contact?.[key] || ''
  };

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};

export default CustomizationContext;
