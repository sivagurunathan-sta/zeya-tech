import React from 'react';
import { FiAlertTriangle as AlertTriangle, FiRefreshCw as RefreshCw, FiHome as Home } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertTriangle className="text-red-500" size={48} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-8">
              We're sorry, but something unexpected happened. This could be a temporary issue.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRefresh}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
              >
                <Home size={20} />
                Go to Homepage
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <div className="mt-4 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-48">
                  <div className="text-red-600 font-semibold mb-2">
                    {this.state.error && this.state.error.toString()}
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component alternative for simpler error states
export const ErrorFallback = ({ error, resetError }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <AlertTriangle className="text-red-500" size={48} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-8">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
          >
            <Home size={20} />
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading component for better UX
export const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default ErrorBoundary;
