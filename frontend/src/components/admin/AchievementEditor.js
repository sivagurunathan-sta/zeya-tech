import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiCalendar } from 'react-icons/fi';
import { achievementAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ImageUploader from './ImageUploader';

const AchievementEditor = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'milestone',
    featured: false,
    images: []
  });

  const queryClient = useQueryClient();

  const { data: achievements, isLoading } = useQuery('achievements', () =>
    achievementAPI.getAll()
  );

  const createMutation = useMutation(achievementAPI.create, {
    onSuccess: () => {
      toast.success('Achievement created successfully!');
      queryClient.invalidateQueries('achievements');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create achievement');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => achievementAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Achievement updated successfully!');
        queryClient.invalidateQueries('achievements');
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update achievement');
      }
    }
  );

  const deleteMutation = useMutation(achievementAPI.delete, {
    onSuccess: () => {
      toast.success('Achievement deleted successfully!');
      queryClient.invalidateQueries('achievements');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete achievement');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      category: 'milestone',
      featured: false,
      images: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (achievement) => {
    setFormData({
      title: achievement.title,
      description: achievement.description,
      date: achievement.date.split('T')[0],
      category: achievement.category,
      featured: achievement.featured,
      images: []
    });
    setEditingId(achievement._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleImagesSelected = (images) => {
    setFormData({ ...formData, images });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600">Manage your company achievements and milestones</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Achievement
        </button>
      </div>

      {/* Achievement Form */}
      {showForm && (
        <motion.div
          className="bg-white rounded-lg shadow mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="milestone">Milestone</option>
                  <option value="award">Award</option>
                  <option value="certification">Certification</option>
                  <option value="recognition">Recognition</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Featured Achievement
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <ImageUploader onImagesSelected={handleImagesSelected} />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Create'} Achievement
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Achievement List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Achievements</h3>
          {isLoading ? (
            <div className="text-center py-8">Loading achievements...</div>
          ) : (
            <div className="space-y-4">
              {achievements?.data?.achievements?.map((achievement) => (
                <div
                  key={achievement._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {achievement.title}
                        </h4>
                        {achievement.featured && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Featured
                          </span>
                        )}
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {achievement.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(achievement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(achievement._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementEditor;
