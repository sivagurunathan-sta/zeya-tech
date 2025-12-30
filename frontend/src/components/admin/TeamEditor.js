// frontend/src/components/admin/TeamEditor.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiLinkedin, FiGithub, FiTwitter, FiCalendar } from 'react-icons/fi';
import { teamAPI } from '../../services/api';
import { getAssetUrl } from '../../services/api';
import toast from 'react-hot-toast';

const TeamEditor = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    bio: '',
    skills: [],
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: ''
    },
    joinDate: '',
    isActive: true,
    isLeader: false
  });

  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading } = useQuery('teamMembers', () =>
    teamAPI.getAll()
  );

  const leadershipCount = () => {
    const list = teamMembers?.data?.team || [];
    return list.filter(m => m.isLeader).length;
  };

  const createMutation = useMutation(teamAPI.create, {
    onSuccess: () => {
      toast.success('Team member added successfully!');
      queryClient.invalidateQueries('teamMembers');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add team member');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => teamAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Team member updated successfully!');
        queryClient.invalidateQueries('teamMembers');
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update team member');
      }
    }
  );

  const deleteMutation = useMutation(teamAPI.delete, {
    onSuccess: () => {
      toast.success('Team member removed successfully!');
      queryClient.invalidateQueries('teamMembers');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove team member');
    }
  });

  const toggleLeaderMutation = useMutation(
    ({ id, isLeader }) => teamAPI.update(id, { isLeader }),
    {
      onSuccess: () => {
        toast.success('Leadership status updated');
        queryClient.invalidateQueries('teamMembers');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update leadership status');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      bio: '',
      skills: [],
      socialLinks: {
        linkedin: '',
        twitter: '',
        github: ''
      },
      joinDate: '',
      isActive: true,
      isLeader: false
    });
    setEditingId(null);
    setShowForm(false);
    setSelectedImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.position.trim()) {
      toast.error('Position is required');
      return;
    }

    const submitData = new FormData();
    
    // Add text fields
    Object.keys(formData).forEach(key => {
      if (key === 'socialLinks') {
        submitData.append('socialLinks[linkedin]', formData.socialLinks.linkedin);
        submitData.append('socialLinks[twitter]', formData.socialLinks.twitter);
        submitData.append('socialLinks[github]', formData.socialLinks.github);
      } else if (key === 'skills') {
        formData.skills.forEach((skill, index) => {
          submitData.append(`skills[${index}]`, skill);
        });
      } else {
        const value = typeof formData[key] === 'boolean' ? String(formData[key]) : formData[key];
        submitData.append(key, value);
      }
    });

    // Add image if selected
    if (selectedImage) {
      submitData.append('image', selectedImage);
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      position: member.position,
      department: member.department || '',
      email: member.email || '',
      phone: member.phone || '',
      bio: member.bio || '',
      skills: member.skills || [],
      socialLinks: {
        linkedin: member.socialLinks?.linkedin || '',
        twitter: member.socialLinks?.twitter || '',
        github: member.socialLinks?.github || ''
      },
      joinDate: member.joinDate ? member.joinDate.split('T')[0] : '',
      isActive: member.isActive,
      isLeader: Boolean(member.isLeader)
    });
    setEditingId(member._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newSkill = e.target.value.trim();
      if (!formData.skills.includes(newSkill)) {
        setFormData({
          ...formData,
          skills: [...formData.skills, newSkill]
        });
      }
      e.target.value = '';
    }
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members and their information</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Team Member Form */}
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
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Senior Developer, Designer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Engineering, Design"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date
                </label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description about the team member"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <input
                type="text"
                placeholder="Type skill and press Enter"
                onKeyDown={handleSkillAdd}
                className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Links
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <FiLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                    })}
                    className="w-full pl-10 pr-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="LinkedIn URL"
                  />
                </div>
                <div className="relative">
                  <FiTwitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                    className="w-full pl-10 pr-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Twitter URL"
                  />
                </div>
                <div className="relative">
                  <FiGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value }
                    })}
                    className="w-full pl-10 pr-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="GitHub URL"
                  />
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {selectedImage && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Active + Leadership Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 accent-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active Team Member
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isLeader"
                  checked={formData.isLeader}
                  onChange={(e) => {
                    const next = e.target.checked;
                    if (next && !formData.isLeader && leadershipCount() >= 3) {
                      toast.error('Only 3 members can be on the leadership board');
                      return;
                    }
                    setFormData({ ...formData, isLeader: next });
                  }}
                  className="h-4 w-4 text-indigo-600 accent-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isLeader" className="ml-2 block text-sm text-gray-900">
                  Show on Leadership Board
                </label>
              </div>
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
                {editingId ? 'Update' : 'Add'} Team Member
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Current Team Members</h3>
          {isLoading ? (
            <div className="text-center py-8">Loading team members...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers?.data?.team?.map((member) => (
                <motion.div
                  key={member._id}
                  className="border border-gray-200 bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-4">
                    {member.image?.url ? (
                      <img
                        src={getAssetUrl(member.image.url)}
                        alt={member.name}
                        className="w-16 h-16 rounded-full mx-auto object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <h4 className="text-lg font-medium text-gray-900 mt-2">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.position}</p>
                    {member.department && (
                      <p className="text-xs text-gray-500">{member.department}</p>
                    )}
                  </div>

                  {member.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{member.bio}</p>
                  )}

                  {/* Skills */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{member.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-1 mb-3">
                    {member.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMail className="w-4 h-4 mr-2" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiPhone className="w-4 h-4 mr-2" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.joinDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-2 mb-4">
                    {member.socialLinks?.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FiLinkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.socialLinks?.twitter && (
                      <a
                        href={member.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <FiTwitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.socialLinks?.github && (
                      <a
                        href={member.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <FiGithub className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Leadership Badge */}
                  {member.isLeader && (
                    <div className="mb-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">Leadership</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        if (!member.isLeader && leadershipCount() >= 3) {
                          toast.error('Only 3 members can be on the leadership board');
                          return;
                        }
                        toggleLeaderMutation.mutate({ id: member._id, isLeader: !member.isLeader });
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${member.isLeader ? 'text-indigo-700 hover:bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'}`}
                      title={member.isLeader ? 'Remove from Leadership' : 'Add to Leadership'}
                    >
                      {member.isLeader ? 'Remove Leadership' : 'Add to Leadership'}
                    </button>
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-2 text-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {member.isLeader && (
                      <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">Leadership</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamEditor;
