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

  let color = "";
  switch (type) {
    case "success":
      color = "bg-green-100 text-green-800 border-green-400";
      break;
    case "error":
      color = "bg-red-100 text-red-800 border-red-400";
      break;
    default:
      color = "bg-blue-100 text-blue-800 border-blue-400";
  }

  // Use a blurred background instead of black
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'}}>
      <div
        className={`rounded-lg shadow-lg border-2 px-6 py-4 max-w-sm w-full ${color} animate-fade-in-up`}
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          zIndex: 100,
        }}
      >
        {title && <div className="text-lg font-semibold mb-1">{title}</div>}
        <div className="text-base">{message}</div>
      </div>
    </div>
  );
};

export default CustomModal;

// Add fade-in-up animation (TailwindCSS users can add this to their config, or use inline style)
// .animate-fade-in-up {
//   animation: fadeInUp 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;
// }
// @keyframes fadeInUp {
//   0% {
//     opacity: 0;
//     transform: translateY(40px);
//   }
//   100% {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
