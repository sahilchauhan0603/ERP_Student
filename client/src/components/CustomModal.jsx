import React, { useEffect } from "react";

const CustomModal = ({ isOpen, onClose, title, message, type = "info", duration = 1800 }) => {
  // Auto-close after duration
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  // Get modal configuration based on type
  const getModalConfig = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-white",
          textColor: "text-gray-800",
          borderColor: "border-green-400",
          iconBgColor: "bg-green-100",
          icon: (
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          progressColor: "bg-green-500"
        };
      case "error":
        return {
          bgColor: "bg-white",
          textColor: "text-gray-800", 
          borderColor: "border-red-400",
          iconBgColor: "bg-red-100",
          icon: (
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 8.586l1.293-1.293a1 1 0 111.414 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ),
          progressColor: "bg-red-500"
        };
      case "warning":
        return {
          bgColor: "bg-white",
          textColor: "text-gray-800",
          borderColor: "border-amber-400", 
          iconBgColor: "bg-amber-100",
          icon: (
            <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          progressColor: "bg-amber-500"
        };
      default:
        return {
          bgColor: "bg-white",
          textColor: "text-gray-800",
          borderColor: "border-gray-300",
          iconBgColor: "bg-gray-100",
          icon: (
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
          progressColor: "bg-gray-600"
        };
    }
  };

  const config = getModalConfig();

  // Enhanced modal with better backdrop and animations
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
      style={{
        backdropFilter: 'blur(8px)', 
        WebkitBackdropFilter: 'blur(8px)', 
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
      }}
    >
      <div
        className={`rounded-2xl shadow-2xl border-2 p-6 max-w-md w-full mx-4 ${config.bgColor} ${config.textColor} ${config.borderColor} animate-fade-in transform transition-all duration-300 hover:shadow-3xl`}
        style={{
          position: 'absolute',
          top: '15%',
          left: '47%',
          // right: '10%',
          transform: 'translate(-50%, 0)',
          zIndex: 100,
          animation: 'modalSlideIn 0.4s ease-out forwards'
        }}
      >
        {/* Header with icon and close button */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 mt-0.5 p-2 ${config.iconBgColor} rounded-full`}>
            {config.icon}
          </div>
          <div className="flex-1">
            {title && (
              <div className="text-xl font-bold text-black mb-2 leading-tight">{title}</div>
            )}
            <div className="text-base text-gray-700 leading-relaxed">{message}</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full transition-all ease-linear ${config.progressColor} relative`}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          >
            {/* Subtle shine effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              style={{
                animation: 'shine 2s infinite'
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Custom animation keyframes */}
      <style jsx="true">{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .modal-container {
            top: 10% !important;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomModal;
