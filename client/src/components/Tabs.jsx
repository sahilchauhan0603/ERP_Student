import React from 'react';

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 border-b mb-2">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          className={`px-4 py-2 font-semibold focus:outline-none ${activeTab === idx ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}
          onClick={() => onTabChange(idx)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
