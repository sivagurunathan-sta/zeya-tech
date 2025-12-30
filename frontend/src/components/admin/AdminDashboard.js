import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  FiAward,
  FiFolderPlus,
  FiUsers,
  FiMail,
  FiSettings,
  FiLogOut,
  FiEdit3,
  FiBarChart,
  FiTool,
  FiUser
} from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import ContentEditor from './ContentEditor';
import ProjectEditor from './ProjectEditor';
import TeamEditor from './TeamEditor';
import SiteCustomization from './SiteCustomization';
import ServicesAdminPage from './ServicesAdminPage';
import AchievementsAdminPage from './AchievementsAdminPage';
import ImageTroubleshooter from '../debug/ImageTroubleshooter';
import AdminProfile from './AdminProfile';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('services');
  const { admin, logout } = useAuth();
  const location = useLocation();

  // Allow deep-linking with ?tab=team etc.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Force light theme on admin pages
  useEffect(() => {
    const hadDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    return () => {
      if (hadDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      }
    };
  }, []);

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: FiBarChart },
    { id: 'content', name: 'Content', icon: FiEdit3 },
    { id: 'services', name: 'Services', icon: FiFolderPlus },
    { id: 'achievements', name: 'Achievements', icon: FiAward },
    { id: 'projects', name: 'Projects', icon: FiFolderPlus },
    { id: 'team', name: 'Team', icon: FiUsers },
    { id: 'messages', name: 'Messages', icon: FiMail },
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'customization', name: 'Site Design', icon: FiSettings },
    { id: 'debug', name: 'Image Debug', icon: FiTool },
  ];

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview setActiveTab={setActiveTab} />;
      case 'content':
        return <ContentEditor />;
      case 'services':
        return <ServicesAdminPage />;
      case 'achievements':
        return <AchievementsAdminPage />;
      case 'projects':
        return <ProjectEditor />;
      case 'team':
        return <TeamEditor />;
      case 'messages':
        return <MessagesPlaceholder />;
      case 'profile':
        return <AdminProfile />;
      case 'customization':
        return <SiteCustomization />;
      case 'debug':
        return <ImageTroubleshooter />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="font-bold text-lg">Zeya Panel</span>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">Welcome, {admin?.username}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700'
                } ${item.id === 'debug' ? 'border-t border-gray-200 mt-2' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.badge === 'NEW' && (
                  <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    NEW
                  </span>
                )}
                {item.id === 'debug' && !item.badge && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    DEV
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-6 left-6">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ setActiveTab }) => {
  const stats = [
    { name: 'Total Projects', value: '24', change: '+2.5%', trend: 'up' },
    { name: 'Team Members', value: '48', change: '+4.2%', trend: 'up' },
    { name: 'Achievements', value: '12', change: '+8.1%', trend: 'up' },
    { name: 'Messages', value: '156', change: '-2.4%', trend: 'down' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your website's key metrics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            className="bg-white p-6 rounded-lg shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-600">New achievement added: "Best Innovation Award"</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Project updated: "Mobile App Development"</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-gray-600">New team member added: John Smith</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('achievements')}
              className="w-full text-left p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span>Manage Achievements</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className="w-full text-left p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span>Manage Services</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className="w-full text-left p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              Create New Project
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className="w-full text-left p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Add Team Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Messages Placeholder Component
const MessagesPlaceholder = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FiMail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Messages Component</h2>
        <p className="text-gray-600 mb-6">
          The messages component is coming soon. This will allow you to manage contact form submissions and user inquiries.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Features coming:</h3>
          <ul className="text-sm text-blue-700 text-left space-y-1">
            <li>• View and respond to contact form submissions</li>
            <li>• Mark messages as read/unread</li>
            <li>• Filter messages by date and status</li>
            <li>• Export message data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
