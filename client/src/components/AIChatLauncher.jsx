import React, { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";
import AIChat from "./AIChat";

export default function AIChatLauncher() {
  const [open, setOpen] = useState(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      const box = document.getElementById("ai-chatbot-popup");
      if (box && !box.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-600 to-red-500 hover:from-blue-700 hover:to-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group flex items-center justify-center"
        // title="AI Chatbot"
        style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)" }}
      >
        <FaRobot className="w-8 h-8" />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          AI Chatbot
        </div>
      </button>

      {open && (
        <div id="ai-chatbot-popup" className="animate-fadeIn">
          <AIChat onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}


