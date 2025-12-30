// Create setupProxy.js in your src folder for advanced proxy configuration
// src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // Keep the /api prefix
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({ 
          error: 'Proxy error', 
          message: 'Unable to connect to backend server' 
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers if needed
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';
        
        console.log(`[PROXY] ${req.method} ${req.url} <- ${proxyRes.statusCode}`);
      },
      logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
      timeout: 30000, // 30 second timeout
    })
  );

  // Proxy static uploads
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      changeOrigin: true,
      onError: (err, req, res) => {
        console.error('Static proxy error:', err.message);
        // Return a default placeholder image or 404
        res.status(404).send('File not found');
      },
      logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
    })
  );
};