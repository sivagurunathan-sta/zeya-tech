// Create frontend/src/components/common/EnhancedImage.js
import React, { useState, useEffect } from 'react';
import { FiImage, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { getAssetUrl } from '../../services/api';

const EnhancedImage = ({ 
  src, 
  alt = '', 
  className = '',
  fallbackSrc = null,
  showDebugInfo = false,
  onLoadError = null,
  placeholder = null,
  ...props 
}) => {
  const [imageState, setImageState] = useState('loading');
  const [currentSrc, setCurrentSrc] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (src) {
      const resolvedSrc = getAssetUrl(src);
      setCurrentSrc(resolvedSrc);
      setImageState('loading');
      setError(null);
      setRetryCount(0);
      
      if (showDebugInfo) {
        console.log('🖼️ EnhancedImage loading:', {
          original: src,
          resolved: resolvedSrc
        });
      }
    }
  }, [src, showDebugInfo]);

  const handleLoad = () => {
    setImageState('loaded');
    if (showDebugInfo) {
      console.log('✅ EnhancedImage loaded successfully:', currentSrc);
    }
  };

  const handleError = (e) => {
    const errorInfo = {
      originalSrc: src,
      currentSrc: currentSrc,
      error: e.type,
      retryCount: retryCount
    };

    console.error('❌ EnhancedImage failed to load:', errorInfo);
    setError(errorInfo);
    
    // Try fallback if available and not already tried
    if (fallbackSrc && currentSrc !== getAssetUrl(fallbackSrc) && retryCount === 0) {
      const fallbackUrl = getAssetUrl(fallbackSrc);
      console.log('🔄 Trying fallback image:', fallbackUrl);
      setCurrentSrc(fallbackUrl);
      setImageState('loading');
      setRetryCount(1);
      return;
    }
    
    setImageState('error');
    
    if (onLoadError) {
      onLoadError(errorInfo);
    }
  };

  const retry = () => {
    if (src) {
      const resolvedSrc = getAssetUrl(src);
      setCurrentSrc(resolvedSrc);
      setImageState('loading');
      setError(null);
      console.log('🔄 Retrying image load:', resolvedSrc);
    }
  };

  // No source provided
  if (!src) {
    return (
      <div className={`bg-gray-100 flex flex-col items-center justify-center ${className}`} {...props}>
        <FiImage className="w-8 h-8 text-gray-400 mb-2" />
        {showDebugInfo && (
          <span className="text-xs text-gray-500">No source provided</span>
        )}
      </div>
    );
  }

  // Error state
  if (imageState === 'error') {
    return (
      <div className={`bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center p-4 ${className}`} {...props}>
        <FiAlertTriangle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-red-600 text-sm text-center mb-2">Failed to load image</p>
        
        <button
          onClick={retry}
          className="flex items-center px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          <FiRefreshCw className="w-3 h-3 mr-1" />
          Retry
        </button>
        
        {showDebugInfo && error && (
          <div className="mt-2 text-xs text-red-500 text-center">
            <p>Original: {error.originalSrc}</p>
            <p>Tried: {error.currentSrc}</p>
            <p>Retries: {error.retryCount}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading placeholder */}
      {imageState === 'loading' && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
          {placeholder || <FiImage className="w-8 h-8 text-gray-400" />}
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${imageState === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* Debug info overlay */}
      {showDebugInfo && imageState === 'loaded' && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2">
          <p>✅ Loaded: {currentSrc}</p>
          {retryCount > 0 && <p>Retries: {retryCount}</p>}
        </div>
      )}
    </div>
  );
};

export default EnhancedImage;