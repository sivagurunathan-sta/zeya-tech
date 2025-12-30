// Create this component to debug image loading issues
// Save as: src/components/debug/ImageDebug.js

import React, { useState } from 'react';
import { getAssetUrl } from '../../services/api';

const ImageDebug = ({ imagePath, alt = "Debug Image" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!imagePath) {
    return (
      <div className="p-4 border border-gray-300 rounded bg-gray-100">
        <p className="text-gray-600">No image path provided</p>
      </div>
    );
  }

  const fullImageUrl = getAssetUrl(imagePath);

  const handleImageLoad = () => {
    setImageLoaded(true);
    console.log('✅ Image loaded successfully:', fullImageUrl);
  };

  const handleImageError = (e) => {
    setImageError(true);
    console.error('❌ Image failed to load:', {
      originalPath: imagePath,
      resolvedUrl: fullImageUrl,
      error: e
    });
  };

  return (
    <div className="p-4 border border-gray-300 rounded">
      <div className="mb-2">
        <strong>Debug Info:</strong>
      </div>
      <div className="text-sm mb-4 space-y-1">
        <div><strong>Original Path:</strong> {imagePath}</div>
        <div><strong>Resolved URL:</strong> {fullImageUrl}</div>
        <div><strong>Status:</strong> 
          <span className={`ml-1 px-2 py-1 rounded text-xs ${
            imageError ? 'bg-red-100 text-red-800' : 
            imageLoaded ? 'bg-green-100 text-green-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {imageError ? 'Error' : imageLoaded ? 'Loaded' : 'Loading'}
          </span>
        </div>
      </div>

      <div className="relative">
        {imageError ? (
          <div className="w-32 h-32 bg-red-100 border-2 border-red-300 rounded flex items-center justify-center">
            <span className="text-red-600 text-sm">Failed to load</span>
          </div>
        ) : (
          <img
            src={fullImageUrl}
            alt={alt}
            className="w-32 h-32 object-cover border rounded"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>

      {/* Test direct access button */}
      <div className="mt-2">
        <button
          onClick={() => window.open(fullImageUrl, '_blank')}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Test Direct Access
        </button>
      </div>
    </div>
  );
};

export default ImageDebug;