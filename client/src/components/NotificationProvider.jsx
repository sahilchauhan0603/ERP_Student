import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheckCircle className="text-green-600" />;
      case 'error':
        return <FaExclamationCircle className="text-red-600" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-600" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className={`${getBackgroundColor()} border rounded-lg p-4 shadow-sm animate-slide-in flex items-start gap-3`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-grow">
        {notification.title && (
          <h4 className={`font-medium ${getTextColor()} mb-1`}>
            {notification.title}
          </h4>
        )}
        <p className={`${getTextColor()} text-sm`}>
          {notification.message}
        </p>
        {notification.details && (
          <details className="mt-2">
            <summary className={`cursor-pointer text-xs ${getTextColor()} opacity-75 hover:opacity-100`}>
              Show details
            </summary>
            <pre className={`mt-1 text-xs ${getTextColor()} opacity-75 whitespace-pre-wrap`}>
              {notification.details}
            </pre>
          </details>
        )}
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className={`flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors ${getTextColor()}`}
        aria-label="Dismiss notification"
      >
        <FaTimes className="text-sm" />
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      autoRemove: true,
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    if (newNotification.autoRemove) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      autoRemove: false, // Errors should not auto-remove
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;