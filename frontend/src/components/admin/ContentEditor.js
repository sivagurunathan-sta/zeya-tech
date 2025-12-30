import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiSave } from 'react-icons/fi';
import { contentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ImageUploader from './ImageUploader';
import { getAssetUrl } from '../../services/api';

const ContentEditor = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    images: []
  });
  const [selectedImages, setSelectedImages] = useState([]);

  const queryClient = useQueryClient();

  const { isLoading } = useQuery(
    ['content', activeSection],
    () => contentAPI.getBySection(activeSection),
    {
      onSuccess: (response) => {
        const content = response?.data?.content;
        if (content) {
          setFormData({
            title: content.title || '',
            subtitle: content.subtitle || '',
            content: content.content || '',
            images: content.images || []
          });
        } else {
          // Initialize with empty form if no content found
          setFormData({
            title: '',
            subtitle: '',
            content: '',
            images: []
          });
        }
      },
      onError: (error) => {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content');
      }
    }
  );

  const updateMutation = useMutation(
    (data) => contentAPI.update(activeSection, data),
    {
      onSuccess: () => {
        toast.success('Content updated successfully!');
        queryClient.invalidateQueries(['content', activeSection]);
        setSelectedImages([]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update content');
      }
    }
  );

  const sections = [
    { id: 'hero', name: 'Hero Section' },
    { id: 'about', name: 'About Section' },
    { id: 'home', name: 'Home Page' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    const submitData = {
      ...formData,
      images: selectedImages
    };

    console.log('Submitting content data:', submitData);
    updateMutation.mutate(submitData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImagesSelected = (images) => {
    setSelectedImages(images);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Editor</h1>
        <p className="text-gray-600">Manage your website content and images</p>
        <div className="mt-2 text-sm text-blue-600">
          Currently editing: <span className="font-medium">{sections.find(s => s.id === activeSection)?.name}</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === section.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      {/* Content Form */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter section title"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter section subtitle"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
              placeholder="Enter section content"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <ImageUploader onImagesSelected={handleImagesSelected} />
            
            {/* Existing Images */}
            {formData.images && formData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getAssetUrl(image.url)}
                        alt={image.alt || 'Content image'}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentEditor;
