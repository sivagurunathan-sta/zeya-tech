import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiUsers, 
  FiTrendingUp, 
  FiClock, 
  FiDollarSign,
  FiFilter,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { projectAPI, getAssetUrl } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../ui/Modal';

const UpcomingProjects = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const { data: projects, isLoading } = useQuery('projects', () =>
    projectAPI.getAll()
  );

  const statuses = [
    { value: 'all', label: 'All Projects' },
    { value: 'planning', label: 'Planning' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' }
  ];

  const filteredProjects = projects?.data?.projects?.filter(
    project => selectedStatus === 'all' || project.status === selectedStatus
  );

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      'on-hold': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      planning: '📋',
      'in-progress': '🚀',
      completed: '✅',
      'on-hold': '⏸️'
    };
    return icons[status] || '📁';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Our Projects
            </motion.h1>
            <motion.p 
              className="text-xl text-green-100 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Explore our current and upcoming projects. From innovative solutions to 
              transformative initiatives, discover how we're shaping the future.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Project Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statuses.slice(1).map((status, index) => {
              const count = projects?.data?.projects?.filter(p => p.status === status.value).length || 0;
              return (
                <motion.div
                  key={status.value}
                  className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="text-3xl mb-2">{getStatusIcon(status.value)}</div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{status.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter and View Controls */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-600" />
                <span className="text-gray-700 font-medium">Filter:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedStatus === status.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">View:</span>
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Display */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProjects && filteredProjects.length > 0 ? (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
              : 'space-y-6'
            }>
              {filteredProjects.map((project, index) => (
                <ProjectCard 
                  key={project._id} 
                  project={project} 
                  index={index} 
                  viewMode={viewMode}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiTrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? 'No projects have been added yet.'
                  : `No projects found with "${selectedStatus.replace('-', ' ')}" status.`
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project, index, viewMode, getStatusColor, getStatusIcon }) => {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const ERROR_IMAGE_URL = 'https://cdn.builder.io/api/v1/image/assets%2Fc22d82f454134145a990d239b199841f%2F501a7b87fe1d4b8e9203ee19b6307667?format=webp&width=800';
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
        viewMode === 'list' ? 'flex' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: viewMode === 'grid' ? -5 : 0 }}
    >
      {/* Project Image */}
      <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'relative'}>
        {project.images && project.images[0] ? (
          <img
            src={getAssetUrl(project.images[0].url)}
            alt={project.title}
            className={viewMode === 'list' ? 'w-full h-full object-cover' : 'w-full h-64 object-cover'}
          />
        ) : (
          <div className={viewMode === 'list' ? 'w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center' : 'w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'}>
            <FiTrendingUp className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Status Badge - Only in grid view */}
        {viewMode === 'grid' && (
          <div className="absolute top-4 right-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
              <span className="mr-1">{getStatusIcon(project.status)}</span>
              {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        )}

        {/* Category Badge - Only in grid view */}
        {viewMode === 'grid' && project.category && (
          <div className="absolute top-4 left-4">
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              {project.category}
            </span>
          </div>
        )}
      </div>

      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        {/* Status and Category - Only in list view */}
        {viewMode === 'list' && (
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
              <span className="mr-1">{getStatusIcon(project.status)}</span>
              {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {project.category && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                {project.category}
              </span>
            )}
          </div>
        )}

        {/* Title and Description */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {project.title}
        </h3>

        {/* Progress/Date Info */}
        <p className="text-blue-600 font-medium">
          {project.progress}% Complete
        </p>

        <p className={`text-gray-600 text-sm leading-relaxed mt-1 ${
          viewMode === 'grid' ? 'mb-4' : 'mb-4 line-clamp-3'
        }`}>
          {project.description}
        </p>

        {/* Progress Bar - Only in list view or as simplified version in grid */}
        {viewMode === 'list' ? (
          <div className="mb-4">
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
        ) : (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Project Details - Simplified for grid view */}
        {viewMode === 'list' ? (
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-2" />
              <span>
                {new Date(project.startDate).toLocaleDateString()}
                {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
              </span>
            </div>

            {project.teamMembers && project.teamMembers.length > 0 && (
              <div className="flex items-center">
                <FiUsers className="w-4 h-4 mr-2" />
                <span>{project.teamMembers.length} team members</span>
              </div>
            )}

            {project.budget && (
              <div className="flex items-center">
                <FiDollarSign className="w-4 h-4 mr-2" />
                <span>${parseInt(project.budget).toLocaleString()}</span>
              </div>
            )}

            {project.client && (
              <div className="flex items-center">
                <span className="font-medium">Client:</span>
                <span className="ml-1">{project.client}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <FiCalendar className="w-3 h-3 mr-1" />
              <span>{new Date(project.startDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Technologies - Different display for grid vs list */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {viewMode === 'list' ? (
                <>
                  {project.technologies.slice(0, 4).map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{project.technologies.length - 4} more
                    </span>
                  )}
                </>
              ) : (
                project.technologies.slice(0, 2).map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tech}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Action Button - Only in grid view */}
        {viewMode === 'grid' && (
          <>
            <div className="mt-4">
              <button onClick={() => setShowErrorModal(true)} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300">
                View Details
              </button>
            </div>
            <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="404 Error" size="lg">
              <div className="flex flex-col items-center">
                <img src={ERROR_IMAGE_URL} alt="404 Error" className="w-full h-auto rounded-lg" />
              </div>
            </Modal>
          </>
        )}

        {/* Timeline Indicator - Only in list view */}
        {viewMode === 'list' && (
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <FiClock className="w-3 h-3 mr-1" />
            <span>
              {project.status === 'completed' ? 'Completed' :
               project.status === 'in-progress' ? 'In Progress' :
               project.status === 'planning' ? 'Planning Phase' :
               'On Hold'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingProjects;
