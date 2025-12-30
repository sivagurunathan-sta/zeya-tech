import React, { useState, useEffect } from 'react';
import { FiStar as Star, FiCheck as Check, FiArrowRight as ArrowRight } from 'react-icons/fi';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?active=true');
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data || []);
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      setError('Unable to load services at this time');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'development', label: 'Development' },
    { value: 'design', label: 'Design' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'security', label: 'Security' },
    { value: 'optimization', label: 'Optimization' },
    { value: 'other', label: 'Other' }
  ];

  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(service => service.category === filter);

  const getIcon = (iconName) => {
    const icons = {
      'FiCode': '💻',
      'FiSmartphone': '📱',
      'FiPenTool': '🎨',
      'FiCloud': '☁️',
      'FiTrendingUp': '📈',
      'FiShield': '🛡️',
      'FiDatabase': '🗄️',
      'FiGlobe': '🌐',
      'FiZap': '⚡',
      'FiSettings': '⚙️'
    };
    return icons[iconName] || '💼';
  };

  const getGradientClasses = (gradient) => {
    const gradientMap = {
      'from-blue-500 to-purple-600': 'from-blue-500 to-purple-600',
      'from-green-500 to-blue-600': 'from-green-500 to-blue-600',
      'from-pink-500 to-orange-500': 'from-pink-500 to-orange-500',
      'from-cyan-500 to-blue-500': 'from-cyan-500 to-blue-500',
      'from-yellow-500 to-red-500': 'from-yellow-500 to-red-500',
      'from-red-500 to-purple-600': 'from-red-500 to-purple-600'
    };
    return gradientMap[gradient] || 'from-blue-500 to-purple-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading our services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Services
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Comprehensive solutions to help your business grow and succeed in the digital world
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setFilter(category.value)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                filter === category.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map(service => (
              <div
                key={service._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Header with Gradient */}
                <div className={`bg-gradient-to-br ${getGradientClasses(service.gradient)} p-6 text-white relative`}>
                  <div className="flex justify-between items-start">
                    <div className="text-3xl mb-2">{getIcon(service.icon)}</div>
                    {service.popular && (
                      <div className="flex items-center bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                        <Star size={12} className="mr-1 fill-current" />
                        Popular
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-sm opacity-90">{service.category}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {service.description}
                  </p>

                  {/* Features */}
                  {service.features && service.features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">What's included:</h4>
                      <ul className="space-y-2">
                        {service.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {service.tags && service.tags.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {service.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-2xl font-bold text-gray-800">
                        {service.price}
                      </div>
                      {service.duration && (
                        <div className="text-sm text-gray-500">
                          {service.duration}
                        </div>
                      )}
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                      Get Started
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No services found
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "We're currently updating our services. Please check back soon!"
                : `No services found in the "${categories.find(c => c.value === filter)?.label}" category.`
              }
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Can't find exactly what you're looking for? We specialize in creating custom solutions tailored to your specific business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Contact Us
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              View Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
