// src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Sidebar for desktop - fixed and h-screen */}
      <div className="hidden md:block">
        <div className="fixed left-0 top-0 h-screen w-64 z-30">
          <AdminSidebar open={true} onClose={() => {}} />
        </div>
      </div>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="md:hidden">
          <AdminSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-white p-2 rounded shadow-md"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6 text-blue-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      {/* Main content - h-screen, scrollable, margin left for sidebar */}
      <div className="min-h-screen h-screen md:ml-64 overflow-y-auto p-4 md:p-6 bg-gray-50 transition-all duration-300">
        <Outlet />
      </div>
    </>
  );
}
