// Complete ServicesAdminPage.js - Fully Working Version
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
  FiStar,
  FiRefreshCw,
  FiUpload,
  FiAlertCircle,
  FiCode,
  FiSmartphone,
  FiGlobe,
  FiDatabase,
  FiShield,
  FiTrendingUp,
  FiSettings,
  FiPenTool,
  FiCloud,
  FiZap
} from 'react-icons/fi';
import { servicesAPI } from '../../services/api';
import { safeArrayExtract, safeFilter, getErrorMessage } from '../../utils/errorHandling';
import toast from 'react-hot-toast';

const ServicesAdminPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    icon: 'FiCode',
    features: [''],
    tags: [''],
    category: 'development',
    duration: '',
    popular: false,
    active: true,
    gradient: 'from-blue-500 to-purple-600'
  });

  const queryClient = useQueryClient();

  // Configuration options
  const iconOptions = [
    { value: 'FiCode', label: 'Code', icon: FiCode },
    { value: 'FiSmartphone', label: 'Mobile', icon: FiSmartphone },
    { value: 'FiPenTool', label: 'Design', icon: FiPenTool },
    { value: 'FiCloud', label: 'Cloud', icon: FiCloud },
    { value: 'FiTrendingUp', label: 'Analytics', icon: FiTrendingUp },
    { value: 'FiShield', label: 'Security', icon: FiShield },
    { value: 'FiDatabase', label: 'Database', icon: FiDatabase },
    { value: 'FiGlobe', label: 'Web', icon: FiGlobe },
    { value: 'FiZap', label: 'Performance', icon: FiZap },
    { value: 'FiSettings', label: 'Settings', icon: FiSettings }
  ];

  const gradientOptions = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-blue-600',
    'from-pink-500 to-orange-500',
    'from-cyan-500 to-blue-500',
    'from-yellow-500 to-red-500',
    'from-red-500 to-purple-600',
    'from-indigo-500 to-pink-500',
    'from-purple-500 to-green-500'
  ];

  const categoryOptions = [
    'development', 'design', 'consulting', 'security', 'optimization', 'other'
  ];

  // Query for fetching services
  const { 
    data: servicesResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['services', 'admin'],
    () => servicesAPI.getAll(),
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0,
      cacheTime: 1000 * 60 * 5,
      retry: 2,
      onError: (error) => {
        console.error('Services fetch error:', error);
        if (error?.response?.status !== 429) {
          toast.error('Failed to load services');
        }
      }
    }
  );

  // Extract services data safely
  const services = safeArrayExtract(servicesResponse, 'data') || [];

  // Mutations
  const createMutation = useMutation(
    (serviceData) => {
      console.log('🔨 Creating service with data:', serviceData);
      return servicesAPI.create(serviceData);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Service created successfully:', response);
        toast.success('Service created successfully!');
        invalidateAllQueries();
        resetForm();
        setIsModalOpen(false);
      },
      onError: (error) => {
        const message = getErrorMessage(error) || 'Failed to create service';
        console.error('❌ Create service error:', error);
        toast.error(message);
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => {
      console.log('🔧 Updating service:', id, data);
      return servicesAPI.update(id, data);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Service updated successfully:', response);
        toast.success('Service updated successfully!');
        invalidateAllQueries();
        resetForm();
        setIsModalOpen(false);
      },
      onError: (error) => {
        const message = getErrorMessage(error) || 'Failed to update service';
        console.error('❌ Update service error:', error);
        toast.error(message);
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => {
      console.log('🗑️ Deleting service:', id);
      return servicesAPI.delete(id);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Service deleted successfully:', response);
        toast.success('Service deleted successfully!');
        invalidateAllQueries();
      },
      onError: (error) => {
        const message = getErrorMessage(error) || 'Failed to delete service';
        console.error('❌ Delete service error:', error);
        toast.error(message);
      }
    }
  );

  const toggleStatusMutation = useMutation(
    (id) => {
      console.log('🔄 Toggling service status:', id);
      return servicesAPI.toggleStatus(id);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Service status toggled successfully:', response);
        toast.success('Service status updated!');
        invalidateAllQueries();
      },
      onError: (error) => {
        const message = getErrorMessage(error) || 'Failed to update status';
        console.error('❌ Toggle service error:', error);
        toast.error(message);
      }
    }
  );

  // Helper functions
  const invalidateAllQueries = () => {
    queryClient.invalidateQueries(['services']);
    queryClient.invalidateQueries(['services', 'admin']);
    queryClient.invalidateQueries(['services', 'public']);
    queryClient.removeQueries(['services']);
    setTimeout(() => refetch(), 100);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      icon: 'FiCode',
      features: [''],
      tags: [''],
      category: 'development',
      duration: '',
      popular: false,
      active: true,
      gradient: 'from-blue-500 to-purple-600'
    });
    setEditingService(null);
    setSelectedImages([]);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    console.log('📝 Opening edit modal for service:', service);
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      price: service.price || '',
      icon: service.icon || 'FiCode',
      features: service.features && service.features.length > 0 ? service.features : [''],
      tags: service.tags && service.tags.length > 0 ? service.tags : [''],
      category: service.category || 'development',
      duration: service.duration || '',
      popular: Boolean(service.popular),
      active: service.active !== false,
      gradient: service.gradient || 'from-blue-500 to-purple-600'
    });
    setSelectedImages([]);
    setIsModalOpen(true);
  };

  const handleArrayFieldChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index, field) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim() || !formData.price.trim()) {
        toast.error('Please fill in all required fields (Title, Description, Price)');
        return;
      }

      // Prepare form data
      const submitData = new FormData();
      
      // Add basic fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', formData.price.trim());
      submitData.append('icon', formData.icon);
      submitData.append('category', formData.category);
      submitData.append('duration', formData.duration.trim());
      submitData.append('popular', String(formData.popular));
      submitData.append('active', String(formData.active));
      submitData.append('gradient', formData.gradient);

      // Add features (clean empty ones)
      const cleanFeatures = formData.features.filter(f => f && f.trim());
      cleanFeatures.forEach((feature, index) => {
        submitData.append(`features[${index}]`, feature.trim());
      });

      // Add tags (clean empty ones)
      const cleanTags = formData.tags.filter(t => t && t.trim());
      cleanTags.forEach((tag, index) => {
        submitData.append(`tags[${index}]`, tag.trim());
      });

      // Add images
      selectedImages.forEach((file) => {
        submitData.append('images', file);
      });

      // Debug in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Submitting form data:');
        for (let [key, value] of submitData.entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
        }
      }

      // Submit
      if (editingService) {
        console.log('🔧 Updating existing service:', editingService._id);
        await updateMutation.mutateAsync({ id: editingService._id, data: submitData });
      } else {
        console.log('🔨 Creating new service');
        await createMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
    }
  };

  const handleDelete = async (service) => {
    const confirmMessage = `Are you sure you want to delete "${service.title}"?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      console.log('🗑️ Confirming deletion of service:', service._id);
      await deleteMutation.mutateAsync(service._id);
    }
  };

  const handleToggleStatus = async (service) => {
    console.log('🔄 Toggling status for service:', service._id, 'Current status:', service.active);
    await toggleStatusMutation.mutateAsync(service._id);
  };

  const handleForceRefresh = async () => {
    console.log('🔄 Force refreshing services...');
    queryClient.removeQueries(['services']);
    queryClient.invalidateQueries(['services']);
    toast.loading('Refreshing services...');
    
    try {
      await refetch();
      toast.dismiss();
      toast.success('Services refreshed successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to refresh services');
      console.error('❌ Refresh error:', error);
    }
  };

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : FiCode;
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 ServicesAdminPage render state:', {
      servicesCount: services.length,
      isLoading,
      error: error?.message,
      isSubmitting,
      editingService: editingService?._id
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Services Management</h1>
              <p className="text-gray-600">Manage your company services and offerings</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500">
                  Total Services: <span className="font-semibold">{services.length}</span>
                </span>
                <span className="text-sm text-gray-500">
                  Active: <span className="font-semibold text-green-600">
                    {safeFilter(services, s => s.active !== false).length}
                  </span>
                </span>
                <span className="text-sm text-gray-500">
                  Popular: <span className="font-semibold text-yellow-600">
                    {safeFilter(services, s => s.popular).length}
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
                Add Service
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <FiAlertCircle className="flex-shrink-0" />
            <div>
              <strong>Error loading services:</strong> {error?.message || 'Unknown error'}
              <button 
                onClick={handleForceRefresh} 
                className="ml-2 text-red-500 hover:text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Services Grid */}
        {Array.isArray(services) && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => {
              const IconComponent = getIconComponent(service.icon);
              return (
                <motion.div
                  key={`${service._id}-${service.title}`}
                  layout
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  whileHover={{ y: -2 }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${service.gradient || 'from-blue-500 to-purple-600'}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {service.title}
                          </h3>
                          {service.popular && (
                            <FiStar className="text-yellow-500 flex-shrink-0" size={16} />
                          )}
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          service.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleStatus(service)}
                          disabled={toggleStatusMutation.isLoading}
                          className={`p-2 rounded-md transition-colors ${
                            service.active 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={service.active ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {service.active ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit service"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          disabled={deleteMutation.isLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete service"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {service.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 capitalize">
                        {service.category}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {service.price}
                      </span>
                    </div>
                    
                    {service.features && service.features.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Features:</p>
                        <div className="text-xs text-gray-600">
                          {service.features.slice(0, 2).join(', ')}
                          {service.features.length > 2 && ` +${service.features.length - 2} more`}
                        </div>
                      </div>
                    )}
                    
                    {/* Debug info in development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 text-xs text-gray-400 border-t pt-2">
                        ID: {service._id}<br/>
                        Updated: {service.updatedAt ? new Date(service.updatedAt).toLocaleString() : 'N/A'}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">Create your first service to get started!</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Service
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
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingService ? 'Edit Service' : 'Create New Service'}
                      {editingService && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          (ID: {editingService._id})
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="Enter service title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price *
                        </label>
                        <input
                          type="text"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="e.g., Starting at $2,999"
                        />
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
                        placeholder="Describe your service..."
                      />
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Icon
                        </label>
                        <select
                          value={formData.icon}
                          onChange={(e) => setFormData(prev => ({...prev, icon: e.target.value}))}
                          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {iconOptions.map(icon => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 4-8 weeks"
                        />
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Features
                      </label>
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleArrayFieldChange(index, e.target.value, 'features')}
                            className="flex-1 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter feature"
                          />
                          {formData.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField(index, 'features')}
                              className="text-red-500 hover:text-red-700 px-2"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayField('features')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                      >
                        <FiPlus size={16} />
                        Add Feature
                      </button>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      {formData.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => handleArrayFieldChange(index, e.target.value, 'tags')}
                            className="flex-1 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter tag"
                          />
                          {formData.tags.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField(index, 'tags')}
                              className="text-red-500 hover:text-red-700 px-2"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayField('tags')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                      >
                        <FiPlus size={16} />
                        Add Tag
                      </button>
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images
                      </label>
                      <div className="space-y-4">
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
                              {selectedImages.length} file(s) selected
                            </span>
                          )}
                        </div>
                        
                        {/* Image Preview */}
                        {selectedImages.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {selectedImages.map((file, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedImages(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                >
                                  <FiX size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Existing Images for Edit Mode */}
                        {editingService && editingService.images && editingService.images.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {editingService.images.map((imageUrl, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={imageUrl}
                                    alt={`Current ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gradient Style */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gradient Style
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {gradientOptions.map(gradient => (
                          <label
                            key={gradient}
                            className={`relative cursor-pointer p-3 rounded-lg border-2 transition-all ${
                              formData.gradient === gradient
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="gradient"
                              value={gradient}
                              checked={formData.gradient === gradient}
                              onChange={(e) => setFormData(prev => ({...prev, gradient: e.target.value}))}
                              className="sr-only"
                            />
                            <div className={`h-8 rounded bg-gradient-to-r ${gradient} mb-2`}></div>
                            <span className="text-xs text-gray-600 font-medium">
                              {gradient.replace('from-', '').replace('to-', ' → ').replace(/-/g, ' ')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.popular}
                          onChange={(e) => setFormData(prev => ({...prev, popular: e.target.checked}))}
                          className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <FiStar size={14} className="text-yellow-500" />
                          Popular Service
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData(prev => ({...prev, active: e.target.checked}))}
                          className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          {formData.active ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                          Active
                        </span>
                      </label>
                    </div>

                    {/* Form Validation Summary */}
                    {(!formData.title.trim() || !formData.description.trim() || !formData.price.trim()) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="text-yellow-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Required fields missing:</p>
                            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                              {!formData.title.trim() && <li>• Title is required</li>}
                              {!formData.description.trim() && <li>• Description is required</li>}
                              {!formData.price.trim() && <li>• Price is required</li>}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t">
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
                        <span>
                          {editingService ? 'Update Service' : 'Create Service'}
                          {isSubmitting && (
                            <span className="text-xs opacity-75 ml-1">
                              ({editingService ? 'Updating...' : 'Creating...'})
                            </span>
                          )}
                        </span>
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
                      
                      {editingService && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to discard all changes? This cannot be undone.')) {
                              resetForm();
                            }
                          }}
                          disabled={isSubmitting}
                          className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Reset Form
                        </button>
                      )}
                    </div>

                    {/* Development Debug Info */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Form State: {JSON.stringify({ 
                            isSubmitting, 
                            hasRequiredFields: formData.title.trim() && formData.description.trim() && formData.price.trim(),
                            selectedImagesCount: selectedImages.length 
                          })}</div>
                          {editingService && <div>Editing Service ID: {editingService._id}</div>}
                          <div>Features Count: {formData.features.filter(f => f.trim()).length}</div>
                          <div>Tags Count: {formData.tags.filter(t => t.trim()).length}</div>
                        </div>
                      </div>
                    )}
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

export default ServicesAdminPage;
