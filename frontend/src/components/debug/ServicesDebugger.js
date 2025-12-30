// Save as: frontend/src/components/debug/ServicesDebugger.js

import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { servicesAPI } from '../../services/api';
import { FiRefreshCw, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

const ServicesDebugger = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Query services for debugging
  const { data: servicesData, isLoading, error, refetch } = useQuery(
    'debug-services',
    () => servicesAPI.getAll(),
    {
      onSuccess: (response) => {
        console.log('🔍 Debug: Services fetched successfully:', response);
      },
      onError: (error) => {
        console.error('❌ Debug: Services fetch error:', error);
      }
    }
  );

  const testCreateService = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing service creation...');
      
      const testData = {
        title: `Test Service ${Date.now()}`,
        description: 'This is a test service created for debugging purposes.',
        price: '$999',
        category: 'development',
        icon: 'FiCode',
        features: ['Test Feature 1', 'Test Feature 2'],
        tags: ['test', 'debug'],
        popular: false,
        active: true,
        gradient: 'from-blue-500 to-purple-600'
      };

      console.log('Test data:', testData);

      const response = await servicesAPI.create(testData);
      console.log('✅ Test service created:', response);

      setTestResult({
        success: true,
        message: 'Service created successfully!',
        data: response.data
      });

      // Refresh the services list
      refetch();

    } catch (error) {
      console.error('❌ Test service creation failed:', error);
      setTestResult({
        success: false,
        message: error?.response?.data?.message || error.message || 'Unknown error',
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  const testUpdateService = async () => {
    const services = servicesData?.data?.data || servicesData?.data || [];
    
    if (services.length === 0) {
      setTestResult({
        success: false,
        message: 'No services available to test update'
      });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing service update...');
      
      const serviceToUpdate = services[0];
      console.log('Service to update:', serviceToUpdate);

      const updateData = {
        title: `${serviceToUpdate.title} (Updated ${Date.now()})`,
        description: serviceToUpdate.description + ' [UPDATED]',
        price: serviceToUpdate.price,
        category: serviceToUpdate.category,
        icon: serviceToUpdate.icon,
        features: serviceToUpdate.features || ['Updated Feature'],
        tags: serviceToUpdate.tags || ['updated'],
        popular: !serviceToUpdate.popular,
        active: serviceToUpdate.active,
        gradient: serviceToUpdate.gradient || 'from-blue-500 to-purple-600'
      };

      console.log('Update data:', updateData);

      const response = await servicesAPI.update(serviceToUpdate._id, updateData);
      console.log('✅ Test service updated:', response);

      setTestResult({
        success: true,
        message: 'Service updated successfully!',
        data: response.data
      });

      // Refresh the services list
      refetch();

    } catch (error) {
      console.error('❌ Test service update failed:', error);
      setTestResult({
        success: false,
        message: error?.response?.data?.message || error.message || 'Unknown error',
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  const services = servicesData?.data?.data || servicesData?.data || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Services Debugger</h1>

      {/* API Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="font-medium text-gray-700">Loading State</div>
            <div className={`text-sm ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
              {isLoading ? 'Loading...' : 'Ready'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="font-medium text-gray-700">Error Status</div>
            <div className={`text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
              {error ? 'Error' : 'No Errors'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="font-medium text-gray-700">Services Count</div>
            <div className="text-sm text-gray-600">{services.length}</div>
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            Refresh Services
          </button>
          <button
            onClick={testCreateService}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Create
          </button>
          <button
            onClick={testUpdateService}
            disabled={loading || services.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Test Update
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <FiCheck className="text-green-600" />
              ) : (
                <FiX className="text-red-600" />
              )}
              <span className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </span>
            </div>
            {testResult.error && (
              <div className="text-sm text-red-600 mt-2">
                <strong>Error Details:</strong> {JSON.stringify(testResult.error?.response?.data || testResult.error, null, 2)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raw Data Display */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw API Response</h2>
        <div className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
          <pre>{JSON.stringify(servicesData, null, 2)}</pre>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <FiAlertTriangle />
            Error Details
          </h2>
          <div className="bg-red-50 p-4 rounded text-sm overflow-auto max-h-96">
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Services</h2>
        {services.length === 0 ? (
          <p className="text-gray-500">No services found</p>
        ) : (
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={service._id || index} className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-900">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {service.category}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {service.price}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {service.active ? 'Active' : 'Inactive'}
                  </span>
                  {service.popular && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  ID: {service._id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesDebugger;