import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import { getAssetUrl } from '../../services/api';

const ImageUploader = ({ 
  onImagesSelected, 
  maxImages = 5, 
  currentImage = null,
  onUpload = null,
  accept = 'image/*',
  label = 'Upload Images'
}) => {
  const [selectedImages, setSelectedImages] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Please select files under 5MB.`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.slice(0, maxImages - selectedImages.length);
    const updatedImages = [...selectedImages, ...newImages];
    setSelectedImages(updatedImages);
    
    if (onImagesSelected) {
      onImagesSelected(updatedImages);
    }

    if (onUpload && newImages.length > 0) {
      onUpload(newImages[0]);
    }
  }, [selectedImages, maxImages, onImagesSelected, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxImages,
    multiple: !onUpload
  });

  const removeImage = (indexToRemove) => {
    const updatedImages = selectedImages.filter((_, index) => index !== indexToRemove);
    setSelectedImages(updatedImages);
    if (onImagesSelected) {
      onImagesSelected(updatedImages);
    }
  };

  if (onUpload) {
    return (
      <div className="space-y-4">
        {currentImage && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Current Image:</p>
            <img
              src={currentImage.startsWith('http') ? currentImage : getAssetUrl(currentImage)}
              alt="Current"
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the image here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-1">{label}</p>
              <p className="text-sm text-gray-400">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the images here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-1">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              PNG, JPG, GIF up to 5MB each (max {maxImages} images)
            </p>
          </div>
        )}
      </div>

      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedImages.map((image, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                {image.name}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
