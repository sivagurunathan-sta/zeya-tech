// Fixed AchievementsAdminPage.js with proper cache invalidation
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiCalendar,
  FiRefreshCw,
  FiUpload,
  FiAlertCircle,
  FiStar,
  FiDownload
} from 'react-icons/fi';
import { achievementAPI, getAssetUrl } from '../../services/api';
import { safeArrayExtract, safeFilter, getErrorMessage } from '../../utils/errorHandling';
import toast from 'react-hot-toast';

const AchievementsAdminPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'milestone',
    featured: false
  });

  const queryClient = useQueryClient();

  // FIXED: Better query configuration with proper keys
  const { 
    data: achievementsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['achievements', 'admin'], // More specific query key
    () => achievementAPI.getAll(),
    {
      refetchOnWindowFocus: true, // Changed to true for admin panel
      refetchOnMount: true,
      staleTime: 0, // Always fetch fresh data in admin
      cacheTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 2,
      onError: (error) => {
        console.error('Achievements fetch error:', error);
        toast.error('Failed to load achievements');
      }
    }
  );

  // Extract achievements data from API response (supports nested shape)
  const achievements = Array.isArray(achievementsResponse?.data?.data?.achievements)
    ? achievementsResponse.data.data.achievements
    : (Array.isArray(achievementsResponse?.data?.achievements)
      ? achievementsResponse.data.achievements
      : []);

  const isFallback = achievementsResponse?.data?.source === 'fallback';

  const normalizedAchievements = achievements.map(a => ({ ...a, _id: a?._id || a?.id }));

  // FIXED: Create mutation with proper cache invalidation
  const createMutation = useMutation(
    (achievementData) => {
      console.log('🏆 Creating achievement with data:', achievementData);
      return achievementAPI.create(achievementData);
    },
    {
      onSuccess: (response, variables) => {
        console.log('✅ Achievement created successfully:', response);
        toast.success('Achievement created successfully!');
        
        // FIXED: Comprehensive cache invalidation
        queryClient.invalidateQueries(['achievements']);
        queryClient.invalidateQueries(['achievements', 'admin']);
        queryClient.invalidateQueries(['achievements', 'public']);
        queryClient.removeQueries(['achievements']); // Clear all achievement queries
        
        // Force immediate refetch
        setTimeout(() => {
          refetch();
        }, 100);
        
        resetForm();
        setIsModalOpen(false);
      },
      onError: (error) => {
        const message = getErrorMessage(error) || 'Failed to create achievement';
        console.error('❌ Create achievement error:', error);
        toast.error(message);
      }
    }
  );

  // FIXED: Update mutation with proper cache invalidation
  const updateMutation = useMutation(
    ({ id, data }) => {
      console.log('🔧 Updating achievement:', id, data);
      return achievementAPI.update(id, data);
    },
    {
      onSuccess: (response, variables) => {
        console.log('✅ Achievement updated successfully:', response);
        toast.success('Achievement updated successfully!');
        
        // FIXED: Comprehensive cache invalidation
        queryClient.invalidateQueries(['achievements']);
        queryClient.invalidateQueries(['achievements', 'admin']);
        queryClient.invalidateQueries(['achievements', 'public']);
        queryClient.removeQueries(['achievements']); // Clear all achievement queries
        
        // Force immediate refetch
        setTimeout(() => {
          refetch();
        }, 100);
        
        resetForm();
        setIsModalOpen(false);
      },
      onError: (error) => {
        const message = getErrorMessage(error) || 'Failed to update achievement';
        console.error('❌ Update achievement error:', error);
        toast.error(message);
      }
    }
  );

  // FIXED: Delete mutation with proper cache invalidation
  const deleteMutation = useMutation(
    (id) => {
      console.log('🗑️ Deleting achievement:', id);
      return achievementAPI.delete(id);
    },
    {
      onSuccess: (response, variables) => {
        console.log('✅ Achievement deleted successfully:', response);
        toast.success('Achievement deleted successfully!');
        
        // FIXED: Comprehensive cache invalidation
        queryClient.invalidateQueries(['achievements']);
        queryClient.invalidateQueries(['achievements', 'admin']);
        queryClient.invalidateQueries(['achievements', 'public']);
        queryClient.removeQueries(['achievements']); // Clear all achievement queries
        
        // Force immediate refetch
        setTimeout(() => {
          refetch();
        }, 100);
      },
      onError: (error) => {
        const message = getErrorMessage(error) || 'Failed to delete achievement';
        console.error('❌ Delete achievement error:', error);
        toast.error(message);
      }
    }
  );

  const categoryOptions = [
    { value: 'milestone', label: 'Milestone', icon: '🎯' },
    { value: 'award', label: 'Award', icon: '🏆' },
    { value: 'certification', label: 'Certification', icon: '📜' },
    { value: 'recognition', label: 'Recognition', icon: '⭐' }
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      category: 'milestone',
      featured: false
    });
    setEditingAchievement(null);
    setSelectedImages([]);
    setSelectedDocuments([]);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (achievement) => {
    if (isFallback) {
      toast.error('Editing is disabled while using fallback data. Please create a new achievement.');
      return;
    }
    console.log('📝 Opening edit modal for achievement:', achievement);
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title || '',
      description: achievement.description || '',
      date: achievement.date ? achievement.date.split('T')[0] : '',
      category: achievement.category || 'milestone',
      featured: Boolean(achievement.featured)
    });
    setSelectedImages([]);
    setSelectedDocuments([]);
    setIsModalOpen(true);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const handleDocumentSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedDocuments(files);
  };

  // FIXED: Better form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
        toast.error('Please fill in all required fields (Title, Description, Date)');
        return;
      }

      // Prepare data object for API service to handle FormData construction
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        category: formData.category,
        featured: formData.featured,
        images: [...selectedImages, ...selectedDocuments] // Combine all files for API service
      };

      console.log('📋 Submitting achievement data:', {
        ...submitData,
        images: submitData.images.map(f => f.name)
      });

      // Submit
      if (editingAchievement) {
        if (isFallback) {
          toast.error('Cannot update fallback achievements. Please create a new one.');
          return;
        }
        const idToUse = editingAchievement._id || editingAchievement.id;
        if (!idToUse) {
          toast.error('Cannot update: missing achievement ID');
          return;
        }
        console.log('🔧 Updating existing achievement:', idToUse);
        await updateMutation.mutateAsync({ id: idToUse, data: submitData });
      } else {
        console.log('🏆 Creating new achievement');
        await createMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      // Error handling is already in the mutations
    }
  };

  const handleDelete = async (achievement) => {
    const confirmMessage = `Are you sure you want to delete "${achievement.title}"?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      if (isFallback) {
        toast.error('Cannot delete fallback achievements.');
        return;
      }
      const idToUse = achievement._id || achievement.id;
      if (!idToUse) {
        toast.error('Cannot delete: missing achievement ID');
        return;
      }
      console.log('🗑️ Confirming deletion of achievement:', idToUse);
      await deleteMutation.mutateAsync(idToUse);
    }
  };

  // FIXED: Force refresh function
  const handleForceRefresh = async () => {
    console.log('🔄 Force refreshing achievements...');
    
    // Clear all achievement-related cache
    queryClient.removeQueries(['achievements']);
    queryClient.invalidateQueries(['achievements']);
    
    // Refetch with loading indicator
    toast.loading('Refreshing achievements...');
    
    try {
      await refetch();
      toast.dismiss();
      toast.success('Achievements refreshed successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to refresh achievements');
      console.error('❌ Refresh error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryInfo = (category) => {
    const info = categoryOptions.find(opt => opt.value === category);
    return info || { value: category, label: category, icon: '🎉' };
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 AchievementsAdminPage render state:', {
      achievementsCount: achievements.length,
      isLoading,
      error: error?.message,
      isSubmitting,
      editingAchievement: editingAchievement?._id
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements Management</h1>
              <p className="text-gray-600">Manage your company achievements and milestones</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500">
                  Total Achievements: <span className="font-semibold">{normalizedAchievements.length}</span>
                </span>
                <span className="text-sm text-gray-500">
                  Featured: <span className="font-semibold text-yellow-600">
                    {safeFilter(normalizedAchievements, a => a.featured).length}
                  </span>
                </span>
                <span className="text-sm text-gray-500">
                  Categories: <span className="font-semibold text-blue-600">
                    {new Set(safeFilter(normalizedAchievements, a => a.category).map(a => a.category)).size}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleForceRefresh}
                disabled={isLoading}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                Force Refresh
              </button>
              <button
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <FiPlus />
                Add Achievement
              </button>
            </div>
          </div>
        </div>

        {/* Error / Fallback Message */}
        {(error || isFallback) && (
          <div className={`px-4 py-3 rounded-lg mb-6 flex items-center gap-2 ${isFallback ? 'bg-yellow-50 border border-yellow-300 text-yellow-800' : 'bg-red-50 border border-red-300 text-red-700'}`}>
            <FiAlertCircle className="flex-shrink-0" />
            <div>
              {isFallback ? (
                <>
                  <strong>Using fallback data:</strong> Editing/deleting existing items is disabled. You can still create new achievements.
                </>
              ) : (
                <>
                  <strong>Error loading achievements:</strong> {error?.message || 'Unknown error'}
                  <button
                    onClick={handleForceRefresh}
                    className="ml-2 underline"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Achievements Grid */}
        {Array.isArray(normalizedAchievements) && normalizedAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalizedAchievements.map(achievement => {
              const categoryInfo = getCategoryInfo(achievement.category);
              return (
                <motion.div
                  key={`${achievement._id}-${achievement.title}`} // More unique key
                  layout
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  whileHover={{ y: -2 }}
                >
                  {/* Image */}
                  {achievement.images && achievement.images.length > 0 && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={getAssetUrl(achievement.images[0].url)}
                        alt={achievement.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{categoryInfo.icon}</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {categoryInfo.label}
                          </span>
                          {achievement.featured && (
                            <FiStar className="text-yellow-500" size={16} />
                          )}
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {achievement.title}
                        </h3>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => openEditModal(achievement)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit achievement"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(achievement)}
                          disabled={deleteMutation.isLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete achievement"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {achievement.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      {formatDate(achievement.date)}
                    </div>

                    {/* Documents */}
                    {achievement.documents && achievement.documents.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {achievement.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={getAssetUrl(doc.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors"
                          >
                            <FiDownload className="w-3 h-3 mr-1" />
                            {doc.name || `Document ${index + 1}`}
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {/* Debug info in development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 text-xs text-gray-400 border-t pt-2">
                        ID: {achievement._id}<br/>
                        Updated: {achievement.updatedAt ? new Date(achievement.updatedAt).toLocaleString() : 'N/A'}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-600 mb-4">Create your first achievement to get started!</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Achievement
            </button>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingAchievement ? 'Edit Achievement' : 'Create New Achievement'}
                      {editingAchievement && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          (ID: {editingAchievement._id})
                        </span>
                      )}
                    </h2>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="Enter achievement title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {categoryOptions.map(cat => (
                            <option key={cat.value} value={cat.value}>
                              {cat.icon} {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                        className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        required
                        placeholder="Describe your achievement..."
                      />
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                        >
                          <FiUpload size={16} />
                          Choose Images
                        </label>
                        {selectedImages.length > 0 && (
                          <span className="text-sm text-gray-600">
                            {selectedImages.length} image(s) selected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Documents (certificates, awards, etc.)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          multiple
                          onChange={handleDocumentSelect}
                          className="hidden"
                          id="document-upload"
                        />
                        <label
                          htmlFor="document-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                        >
                          <FiUpload size={16} />
                          Choose Documents
                        </label>
                        {selectedDocuments.length > 0 && (
                          <span className="text-sm text-gray-600">
                            {selectedDocuments.length} document(s) selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                      </p>
                    </div>

                    {/* Featured Checkbox */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData(prev => ({...prev, featured: e.target.checked}))}
                          className="mr-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Featured Achievement</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Featured achievements will be highlighted prominently</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FiSave size={16} />
                        )}
                        {editingAchievement ? 'Update Achievement' : 'Create Achievement'}
                        {isSubmitting && (
                          <span className="text-xs opacity-75">
                            {editingAchievement ? 'Updating...' : 'Creating...'}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          resetForm();
                        }}
                        disabled={isSubmitting}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      {editingAchievement && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to discard changes?')) {
                              resetForm();
                            }
                          }}
                          disabled={isSubmitting}
                          className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Discard Changes
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AchievementsAdminPage;
