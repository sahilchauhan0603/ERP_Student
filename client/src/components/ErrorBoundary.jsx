import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

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
    
    // Log error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center p-8 max-w-md">
            <FaExclamationTriangle className="mx-auto text-red-500 text-4xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">
              {this.props.fallbackMessage || 
                "An unexpected error occurred while loading this component. Please try refreshing the page."}
            </p>
            
            {this.props.showDetails && this.state.error && (
              <details className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-left">
                <summary className="cursor-pointer text-red-700 font-medium mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                if (this.props.onRetry) {
                  this.props.onRetry();
                }
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaRedo className="text-sm" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;