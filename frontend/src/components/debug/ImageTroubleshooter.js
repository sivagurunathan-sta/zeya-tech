// Create these files in your frontend:

// 1. frontend/src/components/debug/ImageTroubleshooter.js
import React, { useState, useEffect } from 'react';
import { getAssetUrl } from '../../services/api';
import { FiRefreshCw, FiExternalLink, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';

// Default test paths defined outside component to keep stable reference
const DEFAULT_TEST_PATHS = [
  '/uploads/images/test.jpg',
  '/uploads/test.jpg',
  'uploads/images/test.jpg',
  'uploads/test.jpg',
  '/api/uploads/images/test.jpg'
];

const ImageTroubleshooter = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [customTestPath, setCustomTestPath] = useState('');

  // Using DEFAULT_TEST_PATHS (stable reference) to avoid re-creating array on each render

  const testAPIConnection = async () => {
    setIsTestingAPI(true);
    try {
      // Test multiple endpoints
      const endpoints = [
        '/api/health',
        '/api/achievements',
        '/api/projects'
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint => fetch(endpoint))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      
      if (successful > 0) {
        setApiStatus({ 
          status: 'success', 
          message: `API connection successful (${successful}/${endpoints.length} endpoints working)` 
        });
      } else {
        setApiStatus({ 
          status: 'error', 
          message: 'All API endpoints failed to respond' 
        });
      }
    } catch (error) {
      setApiStatus({ 
        status: 'error', 
        message: `Connection failed: ${error.message}` 
      });
    }
    setIsTestingAPI(false);
  };

  const initializeTests = React.useCallback(() => {
    const paths = customTestPath ? [...DEFAULT_TEST_PATHS, customTestPath] : DEFAULT_TEST_PATHS;
    const results = paths.map(path => ({
      originalPath: path,
      resolvedUrl: getAssetUrl(path),
      tested: false,
      result: null,
      error: null,
      responseTime: null
    }));
    setTestResults(results);
  }, [customTestPath]);

  const testImageLoad = async (index) => {
    const startTime = Date.now();
    const testResult = testResults[index];
    
    // Update state to show testing
    setTestResults(prev => prev.map((item, i) => 
      i === index ? { ...item, tested: false, result: 'testing' } : item
    ));

    try {
      const response = await fetch(testResult.resolvedUrl, { method: 'HEAD' });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        setTestResults(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            tested: true, 
            result: 'success', 
            responseTime: responseTime,
            error: null 
          } : item
        ));
      } else {
        setTestResults(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            tested: true, 
            result: 'error', 
            responseTime: responseTime,
            error: `HTTP ${response.status}: ${response.statusText}` 
          } : item
        ));
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setTestResults(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          tested: true, 
          result: 'error', 
          responseTime: responseTime,
          error: error.message 
        } : item
      ));
    }
  };

  const testAllImages = async () => {
    for (let i = 0; i < testResults.length; i++) {
      await testImageLoad(i);
      // Small delay between tests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  useEffect(() => {
    testAPIConnection();
    initializeTests();
  }, [initializeTests]);

  const getStatusIcon = (result) => {
    switch (result) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'error':
        return <FiXCircle className="text-red-500" />;
      case 'testing':
        return <FiRefreshCw className="text-blue-500 animate-spin" />;
      default:
        return <FiAlertTriangle className="text-gray-400" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Loading Troubleshooter</h1>
        <p className="text-gray-600">Debug and test image loading issues in your application</p>
      </div>

      {/* API Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">API Connection Status</h2>
          <button
            onClick={testAPIConnection}
            disabled={isTestingAPI}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${isTestingAPI ? 'animate-spin' : ''}`} />
            Retest
          </button>
        </div>
        
        <div className="p-4 rounded-lg border">
          {isTestingAPI ? (
            <div className="flex items-center">
              <FiRefreshCw className="animate-spin w-5 h-5 text-blue-600 mr-2" />
              Testing API connection...
            </div>
          ) : apiStatus ? (
            <div className={`flex items-center ${
              apiStatus.status === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {apiStatus.status === 'success' ? 
                <FiCheckCircle className="w-5 h-5 mr-2" /> : 
                <FiXCircle className="w-5 h-5 mr-2" />
              }
              {apiStatus.message}
            </div>
          ) : null}
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <strong>NODE_ENV:</strong>
              <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NODE_ENV}</code>
            </div>
            <div className="flex justify-between">
              <strong>API URL:</strong>
              <code className="bg-gray-100 px-2 py-1 rounded">
                {process.env.REACT_APP_API_URL || 'Not set (using proxy)'}
              </code>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <strong>Origin:</strong>
              <code className="bg-gray-100 px-2 py-1 rounded">{window.location.origin}</code>
            </div>
            <div className="flex justify-between">
              <strong>Host:</strong>
              <code className="bg-gray-100 px-2 py-1 rounded">{window.location.host}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Test Path */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Path Test</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customTestPath}
            onChange={(e) => setCustomTestPath(e.target.value)}
            placeholder="Enter custom image path (e.g., /uploads/your-image.jpg)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={initializeTests}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Add Test
          </button>
        </div>
      </div>

      {/* Image Path Testing */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Image Path Resolution Tests</h2>
          <button
            onClick={testAllImages}
            className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Test All Paths
          </button>
        </div>
        
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 space-y-1">
                  <div className="text-sm">
                    <strong>Original:</strong> 
                    <code className="bg-gray-100 px-2 py-1 rounded ml-2">{result.originalPath}</code>
                  </div>
                  <div className="text-sm">
                    <strong>Resolved:</strong> 
                    <code className="bg-blue-50 px-2 py-1 rounded ml-2 text-xs break-all">
                      {result.resolvedUrl}
                    </code>
                  </div>
                  {result.error && (
                    <div className="text-sm text-red-600">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  {result.responseTime && (
                    <div className="text-sm text-gray-500">
                      <strong>Response Time:</strong> {result.responseTime}ms
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {getStatusIcon(result.result)}
                    <span className={`ml-1 text-xs px-2 py-1 rounded ${
                      result.result === 'success' ? 'bg-green-100 text-green-800' :
                      result.result === 'error' ? 'bg-red-100 text-red-800' :
                      result.result === 'testing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {result.result === 'success' ? 'Success' :
                       result.result === 'error' ? 'Failed' :
                       result.result === 'testing' ? 'Testing...' : 'Untested'}
                    </span>
                  </div>
                  <button
                    onClick={() => testImageLoad(index)}
                    disabled={result.result === 'testing'}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => window.open(result.resolvedUrl, '_blank')}
                    className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 flex items-center"
                  >
                    <FiExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solutions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">🔍 Common Issues</h3>
          <ul className="space-y-2 text-sm">
            <li>• Backend not serving static files from /uploads</li>
            <li>• CORS policy blocking image requests</li>
            <li>• Incorrect file paths stored in database</li>
            <li>• Missing environment variables</li>
            <li>• Proxy configuration issues in development</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-green-600 mb-4">✅ Quick Fixes</h3>
          <ul className="space-y-2 text-sm">
            <li>• Check if uploads folder exists in backend</li>
            <li>• Verify static middleware: app.use('/uploads', express.static('uploads'))</li>
            <li>• Set REACT_APP_API_URL environment variable</li>
            <li>• Check Network tab in browser dev tools</li>
            <li>• Clear browser cache and restart dev server</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageTroubleshooter;
