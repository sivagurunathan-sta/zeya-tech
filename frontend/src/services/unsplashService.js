// Create a new file: frontend/src/services/unsplashService.js

// IMPORTANT: Replace 'YOUR_UNSPLASH_ACCESS_KEY' with your actual Unsplash API key
// Get your free API key at: https://unsplash.com/developers

const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_ACCESS_KEY';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

class UnsplashService {
  constructor() {
    this.baseURL = UNSPLASH_BASE_URL;
    this.accessKey = UNSPLASH_ACCESS_KEY;
  }

  // Fetch random nature images for the home page circles
  async fetchNatureImages(count = 4) {
    try {
      const response = await fetch(
        `${this.baseURL}/photos/random?query=nature,landscape,forest,mountains,sunset&count=${count}&orientation=landscape&w=300&h=300&fit=crop`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Return array of image URLs
      return data.map(img => ({
        url: img.urls.small,
        alt: img.alt_description || 'Nature image',
        credit: {
          photographer: img.user.name,
          photographerUrl: img.user.links.html,
          unsplashUrl: img.links.html
        }
      }));
    } catch (error) {
      console.error('Error fetching nature images:', error);
      
      // Return fallback images if API fails
      return this.getFallbackNatureImages(count);
    }
  }

  // Fallback nature images from Unsplash (direct URLs)
  getFallbackNatureImages(count = 4) {
    const fallbackImages = [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center&q=80',
        alt: 'Mountain landscape',
        credit: null
      },
      {
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop&crop=center&q=80',
        alt: 'Forest path',
        credit: null
      },
      {
        url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop&crop=center&q=80',
        alt: 'Ocean view',
        credit: null
      },
      {
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop&crop=center&q=80',
        alt: 'Sunset landscape',
        credit: null
      },
      {
        url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=300&fit=crop&crop=center&q=80',
        alt: 'Mountain lake',
        credit: null
      }
    ];

    return fallbackImages.slice(0, count);
  }

  // Fetch business/office images for About page
  async fetchBusinessImages(count = 1) {
    try {
      const response = await fetch(
        `${this.baseURL}/photos/random?query=business,office,teamwork,collaboration&count=${count}&orientation=landscape&w=1080&h=600&fit=crop`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      const images = Array.isArray(data) ? data : [data];
      
      return images.map(img => ({
        url: img.urls.regular,
        alt: img.alt_description || 'Business office',
        credit: {
          photographer: img.user.name,
          photographerUrl: img.user.links.html,
          unsplashUrl: img.links.html
        }
      }));
    } catch (error) {
      console.error('Error fetching business images:', error);
      
      // Return fallback business image
      return [{
        url: 'https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?w=1080&h=600&fit=crop&crop=center&q=80',
        alt: 'Business teamwork',
        credit: null
      }];
    }
  }

  // Search for specific images
  async searchImages(query, count = 10, orientation = 'landscape') {
    try {
      const response = await fetch(
        `${this.baseURL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.results.map(img => ({
        url: img.urls.regular,
        smallUrl: img.urls.small,
        alt: img.alt_description || query,
        credit: {
          photographer: img.user.name,
          photographerUrl: img.user.links.html,
          unsplashUrl: img.links.html
        }
      }));
    } catch (error) {
      console.error('Error searching images:', error);
      return [];
    }
  }

  // Validate API key
  async validateApiKey() {
    try {
      const response = await fetch(`${this.baseURL}/me`, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating Unsplash API key:', error);
      return false;
    }
  }
}

// Create singleton instance
const unsplashService = new UnsplashService();

export default unsplashService;

// Example usage in components:
/*
import unsplashService from '../services/unsplashService';

// In your component
useEffect(() => {
  const loadNatureImages = async () => {
    try {
      const images = await unsplashService.fetchNatureImages(4);
      setNatureImages(images.map(img => img.url));
    } catch (error) {
      console.error('Failed to load nature images:', error);
    }
  };

  loadNatureImages();
}, []);
*/