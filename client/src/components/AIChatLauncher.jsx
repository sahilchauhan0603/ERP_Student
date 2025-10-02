import React, { useState } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";
import AIChat from "./AIChat";

export default function AIChatLauncher({ studentData = null }) {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed cursor-pointer bottom-6 right-6 z-40 bg-gradient-to-br from-blue-600 via-blue-500 to-red-500 hover:from-blue-700 hover:to-red-600 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 group flex items-center justify-center"
        aria-label="AI Chatbot"
        style={{
          boxShadow:
            "0 6px 30px rgba(37, 99, 235, 0.3), 0 2px 10px rgba(239, 68, 68, 0.2)",
          background: open
            ? "linear-gradient(135deg, #1e40af 0%, #dc2626 100%)"
            : "linear-gradient(135deg, #2563eb 0%, #ef4444 100%)",
        }}
      >
        {open ? (
          <FaTimes className="w-6 h-6 transition-transform duration-300" />
        ) : (
          <FaRobot className="w-6 h-6 transition-transform duration-300" />
        )}

        {/* Pulsing effect when not open */}
        {!open && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-red-400 animate-ping opacity-75 z-[-1]"></div>
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-lg">
          AI Assistant
          <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>

        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
          1
        </div>
      </button>

      {open && (
        <div
          id="ai-chatbot-popup"
          style={{
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <AIChat onClose={() => setOpen(false)} studentData={studentData} />
        </div>
      )}

      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        #ai-chatbot-popup {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
