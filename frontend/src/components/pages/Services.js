import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { FiCheck, FiStar, FiCode, FiSmartphone, FiGlobe, FiDatabase, FiShield, FiTrendingUp } from 'react-icons/fi';
import { servicesAPI, getAssetUrl } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const iconMap = {
  FiCode,
  FiSmartphone,
  FiGlobe,
  FiDatabase,
  FiShield,
  FiTrendingUp,
};

const Services = () => {
  const [filter, setFilter] = useState('all');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const ERROR_IMAGE_URL = 'https://cdn.builder.io/api/v1/image/assets%2Fc22d82f454134145a990d239b199841f%2F501a7b87fe1d4b8e9203ee19b6307667?format=webp&width=800';

  // Use React Query for services data
  const { data: servicesData, isLoading, error } = useQuery(
    ['services'],
    () => servicesAPI.getAll({ active: true }),
    {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
      staleTime: 0,
      cacheTime: 5 * 60 * 1000,
      onSuccess: (response) => {
        console.log('Services fetched successfully:', response);
      },
      onError: (error) => {
        console.error('Error fetching services:', error);
      }
    }
  );


  // Extract services from API response
  const allServices = servicesData?.data?.data || [];

  // Get unique categories from allServices
  const categories = ['all', ...Array.from(new Set(allServices.map(s => s.category).filter(Boolean)))];

  // Filter services based on selected category
  const filteredServices = filter === 'all' 
    ? allServices 
    : allServices.filter(service => service.category === filter);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    console.log('Using default services due to error:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Services</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Comprehensive technology solutions to transform your business and drive innovation
            </p>
            {/* Hero primary actions removed per request */}
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
  {categories.length > 1 && (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    filter === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {category === 'all' ? 'All Services' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From web development to mobile apps, we provide end-to-end technology solutions
              that help businesses thrive in the digital age.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredServices.map((service, index) => {
              const IconComponent = typeof service.icon === 'string' ? (iconMap[service.icon] || FiCode) : (service.icon || FiCode);
              return (
                <motion.div
                  key={service._id || service.id || index}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  {service.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                        <FiStar className="w-4 h-4 mr-1" />
                        Popular
                      </span>
                    </div>
                  )}

                  {/* Service Image */}
                  <div className="relative">
                    {service.images && service.images[0]?.url ? (
                      <img
                        src={getAssetUrl(service.images[0]?.url)}
                        alt={service.title}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
                        <IconComponent className="w-16 h-16 text-blue-600" />
                      </div>
                    )}

                    {/* Popular Badge */}
                    {service.popular && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          <FiStar className="w-3 h-3 inline mr-1" />
                          Popular
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {service.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Category Badge */}
                    {service.category && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {service.title}
                    </h3>

                    <p className="text-blue-600 font-medium">{service.price || 'Contact for pricing'}</p>

                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {service.description}
                    </p>

                    {/* Key Features */}
                    {service.features && service.features.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {service.features.slice(0, 3).map((feature, featureIndex) => (
                            <span key={featureIndex} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              <FiCheck className="w-3 h-3 mr-1" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-4">
                      <button onClick={() => setShowErrorModal(true)} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300">
                        Learn More
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No services found for the selected category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Contact us today to discuss your project requirements and get a custom quote
              tailored to your needs.
            </p>
          </motion.div>
        </div>
      </section>

      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="404 Error" size="lg">
        <div className="flex flex-col items-center">
          <img src={ERROR_IMAGE_URL} alt="404 Error" className="w-full h-auto rounded-lg" />
        </div>
      </Modal>
    </div>
  );
};

export default Services;
