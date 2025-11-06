import React from 'react';

export default function Tabs({ tabs, activeTab, onTabChange, className = '' }) {
  return (
    <div className={`mb-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Desktop Tabs */}
      <div className="hidden md:flex">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            className={`flex-1 px-4 py-3 font-medium whitespace-nowrap cursor-pointer transition-colors focus:outline-none ${
              activeTab === idx
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => onTabChange(idx)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile Tabs - Scrollable */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-1 space-x-1">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors focus:outline-none ${
                activeTab === idx
                  ? "text-blue-600 bg-blue-100 border border-blue-300"
                  : "text-gray-500 bg-gray-100 hover:text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => onTabChange(idx)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
