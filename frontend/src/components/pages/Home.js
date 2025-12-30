import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiUsers, 
  FiAward, 
  FiTarget,
  FiCheck,
  FiStar,
  FiPlay,
  FiChevronRight,
  FiGlobe,
  FiHeart,
  FiShield
} from 'react-icons/fi';
import { useCustomization } from '../../context/CustomizationContext';

const Home = () => {
  const { getColor } = useCustomization();
  const [natureImages, setNatureImages] = useState([]);

  // Load nature images (using fallback images to avoid API errors)
  useEffect(() => {
    // Use high-quality nature images from Unsplash (direct URLs, no API calls)
    setNatureImages([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop&crop=center&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop&crop=center&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop&crop=center&q=80'
    ]);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const metrics = [
    { icon: FiTarget, number: '150+', label: 'Projects Completed', color: 'primary' },
    { icon: FiStar, number: '98%', label: 'Client Satisfaction', color: 'accent' },
    { icon: FiUsers, number: '50+', label: 'Team Projects', color: 'secondary' }, // Changed from "Team Members"
    { icon: FiAward, number: '5+', label: 'Years Experience', color: 'primary' }
  ];

  const features = [
    {
      icon: FiGlobe,
      title: 'Global Reach',
      description: 'Serving clients worldwide with innovative solutions',
      color: 'primary'
    },
    {
      icon: FiHeart,
      title: 'Client-Focused',
      description: 'Dedicated to delivering exceptional customer experiences',
      color: 'accent'
    },
    {
      icon: FiShield,
      title: 'Quality Assurance',
      description: 'Rigorous testing and quality control processes',
      color: 'secondary'
    }
  ];

  // Generate stars for 4.1 rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-1">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <FiStar key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <FiStar className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </div>
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <FiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section
        className="relative min-h-screen text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${getColor('primary')}dd, ${getColor('secondary')}dd, ${getColor('accent')}dd)`
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
            style={{ backgroundColor: getColor('primary') }}
          ></div>
          <div
            className="absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
            style={{ backgroundColor: getColor('accent') }}
          ></div>
          <div
            className="absolute -bottom-32 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"
            style={{ backgroundColor: getColor('secondary') }}
          ></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FiStar className="w-4 h-4 mr-2" />
                Trusted by 500+ Companies Worldwide
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="block">Building the</span>
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Future Together
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
                We create innovative solutions that drive success and build lasting partnerships with our clients worldwide. 
                Experience excellence in every project.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/projects"
                  className="group inline-flex items-center px-8 py-4 bg-white text-blue-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  View Our Projects
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contact"
                  className="group inline-flex items-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 backdrop-blur-md transition-all duration-300"
                >
                  <FiPlay className="mr-2" />
                  Get Started
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {natureImages.slice(0, 4).map((imageUrl, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`Nature ${i + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?fit=crop&w=300&h=300&q=80`;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-blue-100">50+ Team Projects</span>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(4.1)}
                  <span className="text-sm text-blue-100 ml-2">4.1 Rating</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Floating Card */}
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    {metrics.slice(0, 2).map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-blue-100">{metric.label}</span>
                        <span className="text-2xl font-bold">{metric.number}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center animate-bounce">
                  <FiAward className="w-8 h-8 text-yellow-900" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center animate-pulse">
                  <FiCheck className="w-6 h-6 text-green-900" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Company Metrics */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Company Metrics</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Numbers that speak to our commitment and success in delivering exceptional results
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
                variants={fadeInUp}
              >
                <div
                  className="inline-flex p-4 rounded-xl bg-opacity-10 mb-4"
                  style={{
                    backgroundColor: `${getColor(metric.color)}20`
                  }}
                >
                  <metric.icon
                    className="w-8 h-8"
                    style={{ color: getColor(metric.color) }}
                  />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{metric.number}</h3>
                <p className="text-gray-600 font-medium">{metric.label}</p>
                
                {/* Enhanced Progress Bar */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="h-2 rounded-full"
                      style={{ backgroundColor: getColor(metric.color) }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${80 + index * 5}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div 
                  className="absolute top-0 right-0 w-20 h-20 opacity-5 transform rotate-12"
                  style={{ color: getColor(metric.color) }}
                >
                  <metric.icon className="w-full h-full" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose ZEYA-TECH?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We combine innovation, expertise, and dedication to deliver exceptional results that exceed expectations.
              </p>
              
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className="p-3 rounded-xl shadow-lg"
                      style={{ backgroundColor: getColor(feature.color) }}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Growing Fast</h3>
                <p className="text-blue-100 mb-6">
                  Consistently expanding our reach and impact in the industry.
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Expert Team</span>
                    <span className="font-bold">95%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="w-[95%] bg-white rounded-full h-2"></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Award Winning</span>
                    <span className="font-bold">100%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="w-full bg-white rounded-full h-2"></div>
                  </div>
                </div>
                
                <p className="text-sm text-blue-100 mt-6">
                  Talented professionals dedicated to delivering excellence.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Next Project?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Let's discuss how we can help bring your vision to life with our expertise and innovation.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get In Touch
              <FiChevronRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
