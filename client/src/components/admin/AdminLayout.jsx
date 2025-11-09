// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only show unauthorized message if not loading and not authenticated
    if (!loading && (!isAuthenticated || userRole !== 'admin')) {
      // Don't show the message if we're already on the login page
      if (location.pathname !== '/admin') {
        Swal.fire({
          icon: "error",
          title: "Unauthorized Access",
          text: "This page can only be accessed by authorized admins. Please log in as an admin.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate('/admin');
        });
      }
    }
  }, [isAuthenticated, userRole, loading, navigate, location.pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or wrong role
  if (!isAuthenticated || userRole !== 'admin') {
    return null;
  }

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
      {/* Hamburger/Close toggle for mobile */}
      <button
        className="fixed cursor-pointer top-4 left-4 z-40 md:hidden bg-white p-2 rounded shadow-md transition-all duration-300 hover:bg-gray-50"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? (
          // X icon when sidebar is open
          <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger icon when sidebar is closed
          <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {/* Main content - h-screen, scrollable, margin left for sidebar */}
      <div className="min-h-screen h-screen md:ml-64 overflow-y-auto p-4 md:p-6 bg-gray-50 transition-all duration-300">
        <Outlet />
      </div>
    </>
  );
}
