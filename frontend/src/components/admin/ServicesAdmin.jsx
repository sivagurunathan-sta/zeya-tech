import React, { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiStar, FiRefreshCw, FiSave } from 'react-icons/fi';
import useServices from '../../hooks/useServices';
import toast from 'react-hot-toast';

const ServicesAdmin = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    icon: 'FiCode',
    features: [''],
    category: 'development',
    duration: '',
    tags: [''],
    popular: false,
    active: true,
    gradient: 'from-blue-500 to-purple-600'
  });

  // Use the services hook
  const {
    services,
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
    refreshServices
  } = useServices();

  const iconOptions = [
    'FiCode', 'FiSmartphone', 'FiPenTool', 'FiCloud', 'FiTrendingUp', 
    'FiShield', 'FiDatabase', 'FiGlobe', 'FiZap', 'FiSettings'
  ];

  const gradientOptions = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-blue-600',
    'from-pink-500 to-orange-500',
    'from-cyan-500 to-blue-500',
    'from-yellow-500 to-red-500',
    'from-red-500 to-purple-600'
  ];

  const categoryOptions = [
    'development', 'design', 'consulting', 'security', 'optimization', 'other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Clean up empty features and tags
      const cleanFeatures = formData.features.filter(f => f.trim());
      const cleanTags = formData.tags.filter(t => t.trim());

      // Create form data for multipart submission
      const fd = new FormData();
      
      // Add basic fields
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('price', formData.price);
      fd.append('icon', formData.icon);
      fd.append('category', formData.category);
      fd.append('duration', formData.duration);
      fd.append('popular', String(formData.popular));
      fd.append('active', String(formData.active));
      fd.append('gradient', formData.gradient);
      
      // Add arrays properly
      cleanFeatures.forEach((feature, index) => {
        fd.append(`features[${index}]`, feature);
      });
      
      cleanTags.forEach((tag, index) => {
        fd.append(`tags[${index}]`, tag);
      });
      
      // Add images if present
      if (images && images.length > 0) {
        images.forEach((file, index) => {
          fd.append('images', file);
        });
      }

      // Debug log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Submitting service data:');
        for (let [key, value] of fd.entries()) {
          console.log(key, value);
        }
      }

      if (editingService) {
        await updateService.mutateAsync({ id: editingService._id, data: fd });
        toast.success('Service updated successfully!');
      } else {
        await createService.mutateAsync(fd);
        toast.success('Service created successfully!');
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (service) => {
    console.log('Editing service:', service);
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      price: service.price || '',
      icon: service.icon || 'FiCode',
      features: service.features?.length ? service.features : [''],
      category: service.category || 'development',
      duration: service.duration || '',
      tags: service.tags?.length ? service.tags : [''],
      popular: Boolean(service.popular),
      active: service.active !== false, // default to true if undefined
      gradient: service.gradient || 'from-blue-500 to-purple-600'
    });
    setImages([]); // Reset images for edit
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteService.mutateAsync(serviceId);
      toast.success('Service deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to delete service';
      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      await toggleServiceStatus.mutateAsync(service._id);
      toast.success(`Service ${service.active ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Toggle status error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to update service status';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setImages([]);
    setFormData({
      title: '',
      description: '',
      price: '',
      icon: 'FiCode',
      features: [''],
      category: 'development',
      duration: '',
      tags: [''],
      popular: false,
      active: true,
      gradient: 'from-blue-500 to-purple-600'
    });
  };

  const handleArrayChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">Loading services...</div>
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
              <h1 className="text-2xl font-bold text-gray-800">Services Management</h1>
              <p className="text-gray-600 mt-1">Manage your company services and offerings</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-sm text-blue-600 mt-1">
                  Services loaded: {services.length} | Status: {error ? 'Error' : 'OK'}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refreshServices()}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 disabled:opacity-50"
                disabled={isLoading}
              >
                <FiRefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
              >
                <FiPlus size={20} />
                Add Service
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            Error loading services: {error?.message || 'Unknown error'}
            <button 
              onClick={() => refreshServices()} 
              className="ml-2 text-red-500 hover:text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-gray-900">{service.title}</h3>
                  {service.popular && <FiStar className="text-yellow-500" size={16} />}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(service)}
                    className={`p-1 rounded transition-colors ${
                      service.active 
                        ? 'text-green-500 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    disabled={isToggling}
                    title={service.active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                  >
                    {service.active ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1 rounded transition-colors"
                    title="Edit service"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                    disabled={isDeleting}
                    title="Delete service"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{service.description}</p>
              
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                  {service.category}
                </span>
                <span className="font-semibold text-blue-600">{service.price}</span>
              </div>
              
              {service.features && service.features.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Features:</p>
                  <div className="text-xs text-gray-600">
                    {service.features.slice(0, 2).join(', ')}
                    {service.features.length > 2 && ` +${service.features.length - 2} more`}
                  </div>
                </div>
              )}

              {/* Status indicator */}
              <div className={`text-xs px-2 py-1 rounded-full text-center ${
                service.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {service.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No services found. Create your first service to get started!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Create First Service
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                        className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Price *</label>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                        className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Starting at $2,999"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImages(Array.from(e.target.files))}
                      className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {images.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{images.length} file(s) selected</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                        className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categoryOptions.map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Icon</label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({...prev, icon: e.target.value}))}
                        className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon.replace('Fi', '')}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                        className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 4-8 weeks"
                      />
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Features</label>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleArrayChange(index, e.target.value, 'features')}
                          className="flex-1 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter feature"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'features')}
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('features')}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      + Add Feature
                    </button>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => handleArrayChange(index, e.target.value, 'tags')}
                          className="flex-1 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter tag"
                        />
                        {formData.tags.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'tags')}
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('tags')}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      + Add Tag
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Gradient Style</label>
                    <select
                      value={formData.gradient}
                      onChange={(e) => setFormData(prev => ({...prev, gradient: e.target.value}))}
                      className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {gradientOptions.map(gradient => (
                        <option key={gradient} value={gradient}>
                          {gradient.replace('from-', '').replace('to-', ' → ').replace(/-/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.popular}
                        onChange={(e) => setFormData(prev => ({...prev, popular: e.target.checked}))}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      Popular Service
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData(prev => ({...prev, active: e.target.checked}))}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      Active
                    </label>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={isCreating || isUpdating}
                    >
                      {(isCreating || isUpdating) && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <FiSave size={16} />
                      {editingService ? 'Update Service' : 'Create Service'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesAdmin;
