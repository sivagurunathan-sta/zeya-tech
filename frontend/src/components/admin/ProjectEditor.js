// frontend/src/components/admin/ProjectEditor.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { projectAPI, teamAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ImageUploader from './ImageUploader';

const ProjectEditor = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    progress: 0,
    teamMembers: [],
    technologies: [],
    category: '',
    budget: '',
    client: '',
    images: []
  });

  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery('projects', () =>
    projectAPI.getAll()
  );

  const { data: teamMembers } = useQuery('teamMembers', () =>
    teamAPI.getAll()
  );

  const createMutation = useMutation(projectAPI.create, {
    onSuccess: () => {
      toast.success('Project created successfully!');
      queryClient.invalidateQueries('projects');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => projectAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Project updated successfully!');
        queryClient.invalidateQueries('projects');
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update project');
      }
    }
  );

  const deleteMutation = useMutation(projectAPI.delete, {
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      queryClient.invalidateQueries('projects');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      progress: 0,
      teamMembers: [],
      technologies: [],
      category: '',
      budget: '',
      client: '',
      images: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      technologies: formData.technologies.filter(tech => tech.trim() !== ''),
      teamMembers: formData.teamMembers
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      status: project.status,
      progress: project.progress,
      teamMembers: project.teamMembers.map(member => member._id || member),
      technologies: project.technologies || [],
      category: project.category || '',
      budget: project.budget || '',
      client: project.client || '',
      images: []
    });
    setEditingId(project._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleImagesSelected = (images) => {
    setFormData({ ...formData, images });
  };

  const handleTechnologyAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTech = e.target.value.trim();
      if (!formData.technologies.includes(newTech)) {
        setFormData({
          ...formData,
          technologies: [...formData.technologies, newTech]
        });
      }
      e.target.value = '';
    }
  };

  const removeTechnology = (index) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      'on-hold': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your company projects and track progress</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Project
        </button>
      </div>

      {/* Project Form */}
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
                  Project Title *
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
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Web Development, Mobile App"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress (%) - {formData.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Project budget"
                />
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

            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Members
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {teamMembers?.data?.team?.map((member) => (
                  <label key={member._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.teamMembers.includes(member._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            teamMembers: [...formData.teamMembers, member._id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            teamMembers: formData.teamMembers.filter(id => id !== member._id)
                          });
                        }
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technologies
              </label>
              <input
                type="text"
                placeholder="Type technology and press Enter"
                onKeyDown={handleTechnologyAdd}
                className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Project Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Images
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
                {editingId ? 'Update' : 'Create'} Project
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Projects</h3>
          {isLoading ? (
            <div className="text-center py-8">Loading projects...</div>
          ) : (
            <div className="space-y-4">
              {projects?.data?.projects?.map((project) => (
                <div
                  key={project._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {project.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                          {project.status.replace('-', ' ')}
                        </span>
                        {project.category && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            {project.category}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          {new Date(project.startDate).toLocaleDateString()}
                          {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                        </div>
                        {project.teamMembers && project.teamMembers.length > 0 && (
                          <div className="flex items-center">
                            <FiUsers className="w-4 h-4 mr-1" />
                            {project.teamMembers.length} members
                          </div>
                        )}
                        {project.budget && (
                          <div className="flex items-center">
                            <FiTrendingUp className="w-4 h-4 mr-1" />
                            ${parseInt(project.budget).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Technologies */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {project.client && (
                        <p className="text-sm text-gray-600">
                          <strong>Client:</strong> {project.client}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
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

export default ProjectEditor;
