// Replace your Achievement.js with this enhanced version
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { FiCalendar, FiAward, FiDownload, FiFilter } from 'react-icons/fi';
import { achievementAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EnhancedImage from '../common/EnhancedImage';
import { getAssetUrl } from '../../services/api';
import Modal from '../ui/Modal';

const Achievement = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [debugMode, setDebugMode] = useState(process.env.NODE_ENV === 'development');

  const { data: achievements, isLoading } = useQuery(
    ['achievements', currentPage],
    () => achievementAPI.getAll({ page: currentPage, limit: 12 }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
      staleTime: 0,
      cacheTime: 5 * 60 * 1000
    }
  );

  const categories = [
    { value: 'all', label: 'All Achievements' },
    { value: 'award', label: 'Awards' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'certification', label: 'Certifications' },
    { value: 'recognition', label: 'Recognition' }
  ];

  const allAchievements = Array.isArray(achievements?.data?.data?.achievements)
    ? achievements.data.data.achievements
    : (Array.isArray(achievements?.data?.achievements)
      ? achievements.data.achievements
      : (Array.isArray(achievements?.achievements) ? achievements.achievements : []));

  const pagination = achievements?.data?.data?.pagination || achievements?.data?.pagination || achievements?.pagination;

  const filteredAchievements = allAchievements.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const getCategoryIcon = (category) => {
    const icons = {
      award: '🏆',
      milestone: '🎯',
      certification: '📜',
      recognition: '⭐'
    };
    return icons[category] || '🎉';
  };

  const getCategoryColor = (category) => {
    const colors = {
      award: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      milestone: 'bg-blue-100 text-blue-800 border-blue-300',
      certification: 'bg-green-100 text-green-800 border-green-300',
      recognition: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300';
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
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Our Achievements
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Celebrating our journey of excellence, innovation, and recognition in the industry. 
              Each milestone represents our commitment to delivering outstanding results.
            </motion.p>
            
            {/* Debug Toggle - Only in development */}
            {process.env.NODE_ENV === 'development' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4"
              >
                <label className="inline-flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={debugMode}
                    onChange={(e) => setDebugMode(e.target.checked)}
                    className="mr-2"
                  />
                  Show Debug Info
                </label>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-600" />
              <span className="text-gray-700 font-medium">Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredAchievements && filteredAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement._id}
                  achievement={achievement}
                  index={index}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                  debugMode={debugMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiAward className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'No achievements have been added yet.'
                  : `No achievements found in the "${selectedCategory}" category.`
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Want to Achieve Great Things Together?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join us on our journey to excellence and be part of our next achievement story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get In Touch
              </a>
              <a
                href="/projects"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                View Our Work
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Enhanced Achievement Card Component
const AchievementCard = ({ achievement, index, getCategoryIcon, getCategoryColor, debugMode }) => {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const ERROR_IMAGE_URL = 'https://cdn.builder.io/api/v1/image/assets%2Fc22d82f454134145a990d239b199841f%2F501a7b87fe1d4b8e9203ee19b6307667?format=webp&width=800';
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      {/* Enhanced Image with better error handling */}
      <div className="relative">
        {achievement.images?.[0]?.url ? (
          <img
            src={getAssetUrl(achievement.images[0].url)}
            alt={achievement.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FiAward className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Featured Badge */}
        {achievement.featured && (
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              Featured
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            achievement.isActive !== false
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {achievement.isActive !== false ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Category Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(achievement.category)}`}>
            <span className="mr-1">{getCategoryIcon(achievement.category)}</span>
            {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {achievement.title}
        </h3>

        <p className="text-blue-600 font-medium">
          {new Date(achievement.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          })}
        </p>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm leading-relaxed mt-1">
          {achievement.description}
        </p>

        {/* Documents */}
        {achievement.documents && achievement.documents.length > 0 ? (
          <div className="mt-4">
            <a
              href={getAssetUrl(achievement.documents[0].url)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm font-medium inline-flex items-center justify-center"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              View Certificate
            </a>
          </div>
        ) : (
          <div className="mt-4">
            <button onClick={() => setShowErrorModal(true)} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300">
              View Details
            </button>
            <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="404 Error" size="lg">
              <div className="flex flex-col items-center">
                <img src={ERROR_IMAGE_URL} alt="404 Error" className="w-full h-auto rounded-lg" />
              </div>
            </Modal>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Achievement;
