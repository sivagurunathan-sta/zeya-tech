import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock } from 'react-icons/fi';

const Timeline = ({ items = [], orientation = 'vertical' }) => {
  const isVertical = orientation === 'vertical';

  return (
    <div className={`relative ${isVertical ? 'space-y-8' : 'flex space-x-8 overflow-x-auto'}`}>
      {/* Timeline Line */}
      <div
        className={`absolute ${
          isVertical
            ? 'left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500'
            : 'top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500'
        }`}
      />

      {items.map((item, index) => (
        <TimelineItem
          key={index}
          item={item}
          index={index}
          isVertical={isVertical}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
};

const TimelineItem = ({ item, index, isVertical, isLast }) => {
  const {
    title,
    date,
    description,
    status = 'completed',
    icon: CustomIcon,
    image,
    tags = [],
    link
  } = item;

  const statusColors = {
    completed: 'bg-green-500 border-green-300',
    current: 'bg-blue-500 border-blue-300 ring-4 ring-blue-100',
    upcoming: 'bg-gray-300 border-gray-400',
    cancelled: 'bg-red-500 border-red-300'
  };

  const containerClasses = isVertical
    ? 'relative pl-12'
    : 'relative pt-12 flex-shrink-0 w-80';

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: isVertical ? 20 : 0, x: isVertical ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      {/* Timeline Node */}
      <div
        className={`absolute ${
          isVertical ? 'left-0 top-0' : 'top-0 left-4'
        } w-8 h-8 rounded-full border-2 ${statusColors[status]} flex items-center justify-center z-10`}
      >
        {CustomIcon ? (
          <CustomIcon className="w-4 h-4 text-white" />
        ) : (
          <FiCalendar className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content Card */}
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'completed' ? 'bg-green-100 text-green-800' :
              status === 'current' ? 'bg-blue-100 text-blue-800' :
              status === 'upcoming' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          {date && (
            <div className="flex items-center text-sm text-gray-500">
              <FiClock className="w-4 h-4 mr-1" />
              {date}
            </div>
          )}
        </div>

        {/* Image */}
        {image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Link */}
        {link && (
          <a
            href={link.url}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            target={link.external ? '_blank' : '_self'}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >
            {link.text || 'Learn More'}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </motion.div>

      {/* Connector for horizontal timeline */}
      {!isVertical && !isLast && (
        <div className="absolute top-4 right-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform translate-x-full" />
      )}
    </motion.div>
  );
};

export default Timeline;