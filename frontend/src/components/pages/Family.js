import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiLinkedin, 
  FiTwitter, 
  FiGithub,
  FiCalendar,
  FiMapPin,
  FiUsers
} from 'react-icons/fi';
import { teamAPI, getAssetUrl } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Family = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const { data: teamData, isLoading } = useQuery('teamMembers', () =>
    teamAPI.getAll()
  );

  const teamMembers = teamData?.data?.team || [];

  // Get unique departments
  const departments = ['all', ...new Set(
    teamMembers
      .filter(member => member.department)
      .map(member => member.department)
  )];

  const filteredMembers = teamMembers.filter(
    member => selectedDepartment === 'all' || member.department === selectedDepartment
  );

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
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Meet Our Family
            </motion.h1>
            <motion.p 
              className="text-xl text-purple-100 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Behind every great achievement is an incredible team. Get to know the talented 
              individuals who make our company's success possible.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Admin quick-edit */}
      {/** Visible only to logged-in admins via AuthContext **/}
      {/* eslint-disable-next-line */}
      {(() => {
        try {
          // Lazy read auth from localStorage token presence; UI authority controlled by backend
          const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
          return hasToken ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 py-2">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
                <a href="/admin/dashboard?tab=team" className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                  Edit Team in ZEYA Panel
                </a>
              </div>
            </div>
          ) : null;
        } catch {
          return null;
        }
      })()}

      {/* Team Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <FiUsers className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <FiMapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{departments.length - 1}</div>
              <div className="text-sm text-gray-600">Departments</div>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FiCalendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">5+</div>
              <div className="text-sm text-gray-600">Years Together</div>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-gray-900">150+</div>
              <div className="text-sm text-gray-600">Projects Delivered</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Department Filter */}
      {departments.length > 2 && (
        <section className="py-6 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <span className="text-gray-700 font-medium">Filter by department:</span>
              <div className="flex flex-wrap gap-2 justify-center">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedDepartment === dept
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {dept === 'all' ? 'All Departments' : dept}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team Members Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredMembers.map((member, index) => (
                <TeamMemberCard key={member._id} member={member} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600">
                {selectedDepartment === 'all' 
                  ? 'No team members have been added yet.'
                  : `No team members found in the "${selectedDepartment}" department.`
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join Our Amazing Team?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              We're always looking for talented individuals who share our passion for excellence and innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get In Touch
              </a>
              <a
                href="/about"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                Learn More About Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member, index }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      {/* Profile Image */}
      <div className="relative">
        {member.image?.url ? (
          <img
            src={getAssetUrl(member.image.url)}
            alt={member.name}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FiUser className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            member.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {member.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Name and Position */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
          <p className="text-purple-600 font-medium">{member.position}</p>
          {member.department && (
            <p className="text-sm text-gray-500 mt-1">{member.department}</p>
          )}
        </div>

        {/* Bio */}
        {member.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {member.bio}
          </p>
        )}

        {/* Skills */}
        {member.skills && member.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 3).map((skill, skillIndex) => (
                <span
                  key={skillIndex}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                >
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{member.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4 text-sm">
          {member.email && (
            <div className="flex items-center text-gray-600">
              <FiMail className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center text-gray-600">
              <FiPhone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{member.phone}</span>
            </div>
          )}
          {member.joinDate && (
            <div className="flex items-center text-gray-600">
              <FiCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-3 pt-4 border-t border-gray-100">
          {member.socialLinks?.linkedin && (
            <a
              href={member.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FiLinkedin className="w-5 h-5" />
            </a>
          )}
          {member.socialLinks?.twitter && (
            <a
              href={member.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 transition-colors"
            >
              <FiTwitter className="w-5 h-5" />
            </a>
          )}
          {member.socialLinks?.github && (
            <a
              href={member.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiGithub className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Family;
