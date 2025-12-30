// Enhanced App.js - ESLint Compliant Version
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CustomizationProvider } from './context/CustomizationContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Components
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './components/pages/Home';
import Achievement from './components/pages/Achievement';
import UpcomingProjects from './components/pages/UpcomingProjects';
import Family from './components/pages/Family';
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import Services from './components/pages/Services';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

// Styles
import './App.css';

// Debug Components (only in development) - MOVED TO TOP
const ImageTroubleshooter = React.lazy(() => 
  import('./components/debug/ImageTroubleshooter')
);

// Enhanced QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 404, 401, or 429 errors
        const status = error?.response?.status;
        if (status === 404 || status === 401 || status === 429) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        // Global error handling
        if (error?.response?.status !== 429) { // Don't log rate limit errors
          console.error('Query error:', error);
        }
      }
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        const status = error?.response?.status;
        if (status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 1; // Only retry once for mutations
      },
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    },
  },
});

// Enhanced 404 component with better UX
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto px-6">
      <div className="mb-8">
        <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      
      <div className="space-y-4">
        <a 
          href="/" 
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Go to Homepage
        </a>
        
        <div className="flex space-x-4">
          <a 
            href="/services" 
            className="flex-1 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-center"
          >
            Services
          </a>
          <a 
            href="/about" 
            className="flex-1 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-center"
          >
            About
          </a>
          <a 
            href="/contact" 
            className="flex-1 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-center"
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CustomizationProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '14px',
                      fontWeight: '500',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                      style: {
                        background: '#065f46',
                        color: '#d1fae5',
                        border: '1px solid #047857',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                      style: {
                        background: '#7f1d1d',
                        color: '#fecaca',
                        border: '1px solid #dc2626',
                      },
                    },
                    loading: {
                      duration: Infinity,
                      style: {
                        background: '#1e40af',
                        color: '#dbeafe',
                        border: '1px solid #3b82f6',
                      },
                    },
                  }}
                />
                
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="achievements" element={<Achievement />} />
                    <Route path="projects" element={<UpcomingProjects />} />
                    <Route path="family" element={<Family />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="services" element={<Services />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Debug Routes (Development Only) */}
                  {process.env.NODE_ENV === 'development' && (
                    <Route 
                      path="/debug/images" 
                      element={
                        <React.Suspense 
                          fallback={
                            <div className="min-h-screen flex items-center justify-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                          }
                        >
                          <ImageTroubleshooter />
                        </React.Suspense>
                      } 
                    />
                  )}
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* React Query Devtools (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                  <ReactQueryDevtools 
                    initialIsOpen={false}
                    position="bottom-right"
                  />
                )}
              </div>
            </Router>
          </AuthProvider>
        </CustomizationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;