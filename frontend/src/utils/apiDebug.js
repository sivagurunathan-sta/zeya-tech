// API debugging utilities

export const debugAPICall = (method, url, data = null) => {
  console.group(`🔍 API ${method.toUpperCase()} ${url}`);
  console.log('Timestamp:', new Date().toISOString());
  console.log('URL:', url);
  if (data) console.log('Request Data:', data);
  console.groupEnd();
};

export const debugAPIResponse = (method, url, response, duration) => {
  console.group(`✅ API ${method.toUpperCase()} ${url} - ${response.status}`);
  console.log('Duration:', `${duration}ms`);
  console.log('Status:', response.status);
  console.log('Response:', response.data);
  console.groupEnd();
};

export const debugAPIError = (method, url, error, duration) => {
  console.group(`❌ API ${method.toUpperCase()} ${url} - ERROR`);
  console.log('Duration:', `${duration}ms`);
  console.log('Error Code:', error.code);
  console.log('Error Message:', error.message);
  if (error.response) {
    console.log('Response Status:', error.response.status);
    console.log('Response Data:', error.response.data);
  }
  console.groupEnd();
};

export const testAPIConnection = async () => {
  try {
    const startTime = Date.now();
    const response = await fetch('/api/health');
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection Test Passed', { duration: `${duration}ms`, data });
      return { success: true, duration, data };
    } else {
      console.log('❌ API Connection Test Failed', { status: response.status, duration: `${duration}ms` });
      return { success: false, status: response.status, duration };
    }
  } catch (error) {
    console.log('❌ API Connection Test Error', { error: error.message });
    return { success: false, error: error.message };
  }
};

// Auto-test API connection in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    testAPIConnection();
  }, 2000);
}
