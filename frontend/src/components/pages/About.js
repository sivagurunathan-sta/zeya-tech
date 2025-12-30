import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FiTarget, 
  FiHeart, 
  FiUsers, 
  FiTrendingUp,
  FiAward,
  FiGlobe,
  FiClock
} from 'react-icons/fi';
import { contentAPI, teamAPI, getAssetUrl } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const About = () => {
  const { data: aboutContent, isLoading } = useQuery('aboutContent', () =>
    contentAPI.getBySection('about')
  );

  // Load team to power editable leadership cards
  const { data: teamData } = useQuery('teamMembers', () => teamAPI.getAll(), { staleTime: 5 * 60 * 1000 });

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" {...fadeInUp}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              About ZEYA-TECH
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover our story, mission, and the values that drive us to deliver exceptional results for our clients worldwide through innovative technology solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2019, ZEYA-TECH began with a simple mission: to bridge the gap between 
                innovative technology and real-world business solutions. What started as a small team 
                of passionate developers has grown into a full-service digital technology company.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe that every business deserves access to cutting-edge technology that drives 
                growth and success. Our journey has been marked by continuous learning, adaptation, 
                and an unwavering commitment to excellence in every project we undertake.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2019</div>
                  <div className="text-sm text-gray-600">Founded</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">150+</div>
                  <div className="text-sm text-gray-600">Projects</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?fit=crop&w=1080&q=80"
                  alt="ZEYA-TECH Office - Team collaboration and innovation"
                  className="object-cover w-full h-96"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?fit=crop&w=1080&q=80";
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">Client Satisfaction</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Foundation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles and beliefs that guide everything we do at ZEYA-TECH
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Mission */}
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={fadeInUp}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-6">
                <FiTarget className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To empower businesses with innovative technology solutions that drive growth, 
                efficiency, and success. We strive to be the trusted partner that transforms 
                ideas into reality through exceptional digital experiences and cutting-edge development.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={fadeInUp}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-2xl mb-6">
                <FiTrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the leading digital transformation partner globally, known for our 
                innovation, quality, and commitment to client success. We envision a future 
                where technology seamlessly enhances every business operation and drives meaningful impact.
              </p>
            </motion.div>

            {/* Values */}
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={fadeInUp}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-2xl mb-6">
                <FiHeart className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrity, innovation, collaboration, and excellence form the core of our culture. 
                We believe in transparent communication, continuous learning, and delivering 
                value that exceeds expectations in every project and client relationship.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-gray-600">
              Measuring ZEYA-TECH's success through tangible results and client satisfaction
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
                <FiUsers className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">150+</div>
              <div className="text-gray-600">Happy Clients</div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-2xl mb-4">
                <FiAward className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">250+</div>
              <div className="text-gray-600">Projects Delivered</div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl mb-4">
                <FiGlobe className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
              <div className="text-gray-600">Countries Served</div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl mb-4">
                <FiClock className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">5+</div>
              <div className="text-gray-600">Years Experience</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership Team Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Leadership
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              The visionary minds behind ZEYA-TECH's success story and innovation journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Leadership cards powered by Team collection (department: 'Leadership') with fallback */}
            {(() => {
              const team = teamData?.data?.team || [];
              let leadership = team.filter(m => m.isLeader);
              if (leadership.length === 0) {
                leadership = team
                  .filter(m => (m.department && m.department.toLowerCase() === 'leadership') || /ceo|cto|head/i.test(m.position || ''))
                  .slice(0, 3);
              } else {
                leadership = leadership.slice(0, 3);
              }
              const cards = leadership.length > 0 ? leadership.map(m => ({
                name: m.name,
                role: m.position,
                image: m.image?.url ? getAssetUrl(m.image.url) : '',
                description: m.bio || ''
              })) : [
                { name: 'Sivakumar R', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300&q=80', description: 'Visionary leader with 10+ years in tech innovation' },
                { name: 'Priya Sharma', role: 'CTO', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?fit=crop&w=300&h=300&q=80', description: 'Technology expert driving our development strategy' },
                { name: 'Arjun Patel', role: 'Head of Projects', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=300&h=300&q=80', description: 'Project management excellence and client satisfaction' }
              ];
              return cards.map((leader, index) => (
                <motion.div
                  key={`${leader.name}-${index}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-64 object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300&q=80'; }}
                  />
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{leader.role}</p>
                    {leader.description && (
                      <p className="text-gray-600 text-sm">{leader.description}</p>
                    )}
                  </div>
                </motion.div>
              ));
            })()}
          </div>

          <div className="text-center space-y-3">
            <a
              href="/family"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Meet the Full Team
            </a>
            {/* Admin-only quick edit button (visible if auth token present) */}
            {/* eslint-disable-next-line */}
            {(() => { try { return localStorage.getItem('token') ? (
              <a href="/admin/dashboard?tab=team" className="block text-sm text-blue-600 hover:text-blue-700">Edit these cards in ZEYA Panel</a>
            ) : null; } catch { return null; } })()}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Journey With ZEYA-TECH?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Let's collaborate to turn your vision into reality. Get in touch with our team today and discover how we can transform your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start a Conversation
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

export default About;
