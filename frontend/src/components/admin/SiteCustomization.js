import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiImage,
  FiType,
  FiMonitor,
  FiSave,
  FiRotateCcw,
  FiEye,
  FiSettings
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useCustomization } from '../../context/CustomizationContext';
import ImageUploader from './ImageUploader';

const SiteCustomization = () => {
  const [customization, setCustomization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [previewMode, setPreviewMode] = useState(false);
  const { refreshCustomization } = useCustomization();

  const tabs = [
    { id: 'branding', name: 'Branding', icon: FiImage },
    { id: 'typography', name: 'Typography', icon: FiType },
    { id: 'colors', name: 'Colors', icon: FiImage },
    { id: 'background', name: 'Background', icon: FiMonitor },
    { id: 'general', name: 'General', icon: FiSettings }
  ];

  useEffect(() => {
    loadCustomization();
  }, []);

  const loadCustomization = async () => {
    try {
      const response = await api.get('/customizations');
      setCustomization(response.data.data);
    } catch (error) {
      toast.error('Failed to load customization settings');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setCustomization(prev => ({
      ...prev,
      [field]: typeof value === 'object' ? { ...prev[field], ...value } : value
    }));
  };

  const updateNestedField = (parent, field, value) => {
    setCustomization(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(customization));
      
      const response = await api.put('/customizations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Customization saved successfully!');
      setCustomization(response.data.data);

      await refreshCustomization();
    } catch (error) {
      toast.error('Failed to save customization');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all customizations to default?')) {
      return;
    }

    try {
      const response = await api.post('/customizations/reset');
      setCustomization(response.data.data);
      toast.success('Customization reset to defaults');

      await refreshCustomization();
    } catch (error) {
      toast.error('Failed to reset customization');
    }
  };

  const handleImageUpload = async (field, file) => {
    const formData = new FormData();
    formData.append(field, file);
    formData.append('data', JSON.stringify(customization));

    try {
      const response = await api.put('/customizations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCustomization(response.data.data);
      toast.success(`${field} uploaded successfully!`);

      await refreshCustomization();
    } catch (error) {
      toast.error(`Failed to upload ${field}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Customization</h1>
          <p className="text-gray-600">Customize your website's appearance and branding</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiEye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiRotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 mr-8">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            {activeTab === 'branding' && (
              <BrandingTab 
                customization={customization}
                updateField={updateField}
                updateNestedField={updateNestedField}
                onImageUpload={handleImageUpload}
              />
            )}
            {activeTab === 'typography' && (
              <TypographyTab 
                customization={customization}
                updateNestedField={updateNestedField}
              />
            )}
            {activeTab === 'colors' && (
              <ColorsTab 
                customization={customization}
                updateNestedField={updateNestedField}
              />
            )}
            {activeTab === 'background' && (
              <BackgroundTab 
                customization={customization}
                updateNestedField={updateNestedField}
                onImageUpload={handleImageUpload}
              />
            )}
            {activeTab === 'general' && (
              <GeneralTab 
                customization={customization}
                updateNestedField={updateNestedField}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Branding Tab Component
const BrandingTab = ({ customization, updateNestedField, onImageUpload }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Logo & Branding</h3>
    
    {/* Logo Upload */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
      <ImageUploader
        currentImage={customization?.logo?.url}
        onUpload={(file) => onImageUpload('logo', file)}
        accept="image/*"
        label="Upload Logo"
      />
      {customization?.logo?.url && (
        <div className="mt-4 flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Width (px)</label>
            <input
              type="number"
              value={customization.logo.width || 120}
              onChange={(e) => updateNestedField('logo', 'width', parseInt(e.target.value))}
              className="w-24 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Height (px)</label>
            <input
              type="number"
              value={customization.logo.height || 40}
              onChange={(e) => updateNestedField('logo', 'height', parseInt(e.target.value))}
              className="w-24 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>

    {/* Favicon Upload */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
      <ImageUploader
        currentImage={customization?.favicon?.url}
        onUpload={(file) => onImageUpload('favicon', file)}
        accept="image/*"
        label="Upload Favicon"
      />
      <p className="text-sm text-gray-500 mt-1">
        Recommended size: 32x32 pixels. Accepts PNG, ICO, or SVG format.
      </p>
    </div>
  </div>
);

// Typography Tab Component  
const TypographyTab = ({ customization, updateNestedField }) => {
  const fonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Poppins', 'Nunito', 'Source Sans Pro'
  ];

  const weights = [
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Regular (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi Bold (600)' },
    { value: '700', label: 'Bold (700)' },
    { value: '800', label: 'Extra Bold (800)' },
    { value: '900', label: 'Black (900)' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Typography Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Font</label>
          <select
            value={customization?.fonts?.primary || 'Inter'}
            onChange={(e) => updateNestedField('fonts', 'primary', e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {fonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Font</label>
          <select
            value={customization?.fonts?.secondary || 'Inter'}
            onChange={(e) => updateNestedField('fonts', 'secondary', e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {fonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Heading Weight</label>
          <select
            value={customization?.fonts?.headingWeight || '600'}
            onChange={(e) => updateNestedField('fonts', 'headingWeight', e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {weights.map(weight => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body Weight</label>
          <select
            value={customization?.fonts?.bodyWeight || '400'}
            onChange={(e) => updateNestedField('fonts', 'bodyWeight', e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {weights.filter(w => parseInt(w.value) <= 700).map(weight => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Typography Preview</h4>
        <div style={{ 
          fontFamily: customization?.fonts?.primary || 'Inter',
          fontWeight: customization?.fonts?.headingWeight || '600'
        }}>
          <h1 className="text-2xl mb-2">This is a heading</h1>
        </div>
        <div style={{ 
          fontFamily: customization?.fonts?.secondary || 'Inter',
          fontWeight: customization?.fonts?.bodyWeight || '400'
        }}>
          <p className="text-gray-600">
            This is body text. It demonstrates how your chosen typography will look on the website.
          </p>
        </div>
      </div>
    </div>
  );
};

// Colors Tab Component
const ColorsTab = ({ customization, updateNestedField }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Color Scheme</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { key: 'primary', label: 'Primary Color', description: 'Main brand color' },
        { key: 'secondary', label: 'Secondary Color', description: 'Supporting color' },
        { key: 'accent', label: 'Accent Color', description: 'Highlight color' },
        { key: 'background', label: 'Background Color', description: 'Page background' },
        { key: 'text', label: 'Text Color', description: 'Primary text' },
        { key: 'textSecondary', label: 'Secondary Text', description: 'Muted text' }
      ].map(color => (
        <div key={color.key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{color.label}</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={customization?.colors?.[color.key] || '#3b82f6'}
              onChange={(e) => updateNestedField('colors', color.key, e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={customization?.colors?.[color.key] || '#3b82f6'}
              onChange={(e) => updateNestedField('colors', color.key, e.target.value)}
              className="flex-1 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
              placeholder="#3b82f6"
            />
          </div>
          <p className="text-xs text-gray-500">{color.description}</p>
        </div>
      ))}
    </div>

    {/* Color Preview */}
    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Color Preview</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(customization?.colors || {}).map(([key, value]) => (
          <div key={key} className="text-center">
            <div 
              className="w-full h-16 rounded-lg border border-gray-200 mb-2"
              style={{ backgroundColor: value }}
            ></div>
            <p className="text-xs text-gray-600 capitalize">{key}</p>
            <p className="text-xs font-mono text-gray-500">{value}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Background Tab Component
const BackgroundTab = ({ customization, updateNestedField, onImageUpload }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Background Settings</h3>
    
    {/* Background Image */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
      <ImageUploader
        currentImage={customization?.backgroundImage?.url}
        onUpload={(file) => onImageUpload('backgroundImage', file)}
        accept="image/*"
        label="Upload Background Image"
      />
    </div>

    {customization?.backgroundImage?.url && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={customization.backgroundImage.opacity || 0.1}
            onChange={(e) => updateNestedField('backgroundImage', 'opacity', parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Current: {Math.round((customization.backgroundImage.opacity || 0.1) * 100)}%
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
          <select
            value={customization.backgroundImage.position || 'center'}
            onChange={(e) => updateNestedField('backgroundImage', 'position', e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <select
            value={customization.backgroundImage.size || 'cover'}
            onChange={(e) => updateNestedField('backgroundImage', 'size', e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
            <option value="100%">100%</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Repeat</label>
          <select
            value={customization.backgroundImage.repeat || 'no-repeat'}
            onChange={(e) => updateNestedField('backgroundImage', 'repeat', e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="no-repeat">No Repeat</option>
            <option value="repeat">Repeat</option>
            <option value="repeat-x">Repeat X</option>
            <option value="repeat-y">Repeat Y</option>
          </select>
        </div>
      </div>
    )}
  </div>
);

// General Tab Component
const GeneralTab = ({ customization, updateNestedField }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
    
    {/* SEO Settings */}
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-800">SEO Settings</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
        <input
          type="text"
          value={customization?.seo?.title || ''}
          onChange={(e) => updateNestedField('seo', 'title', e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your Company Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
        <textarea
          value={customization?.seo?.description || ''}
          onChange={(e) => updateNestedField('seo', 'description', e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          placeholder="Brief description of your company..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
        <input
          type="text"
          value={customization?.seo?.keywords || ''}
          onChange={(e) => updateNestedField('seo', 'keywords', e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>
    </div>

    {/* Social Media Links */}
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-800">Social Media Links</h4>
      
      {[
        { key: 'linkedin', label: 'LinkedIn' },
        { key: 'twitter', label: 'Twitter' },
        { key: 'facebook', label: 'Facebook' },
        { key: 'instagram', label: 'Instagram' },
        { key: 'youtube', label: 'YouTube' },
        { key: 'github', label: 'GitHub' }
      ].map(social => (
        <div key={social.key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">{social.label}</label>
          <input
            type="url"
            value={customization?.socialMedia?.[social.key] || ''}
            onChange={(e) => updateNestedField('socialMedia', social.key, e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`https://${social.key}.com/yourcompany`}
          />
        </div>
      ))}
    </div>

    {/* Contact Information */}
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-800">Contact Information</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
        <input
          type="tel"
          value={customization?.contact?.phone || ''}
          onChange={(e) => updateNestedField('contact', 'phone', e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={customization?.contact?.email || ''}
          onChange={(e) => updateNestedField('contact', 'email', e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="contact@yourcompany.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          value={customization?.contact?.address || ''}
          onChange={(e) => updateNestedField('contact', 'address', e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          placeholder="123 Business St, City, State 12345"
        />
      </div>
    </div>
  </div>
);

export default SiteCustomization;
