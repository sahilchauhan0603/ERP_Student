// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    
    // Set up continuous authentication monitoring
    const authInterval = setInterval(() => {
      checkAuth();
    }, 10000); // Check every 30 seconds
    
    return () => {
      clearInterval(authInterval);
    };
  }, []);

  // Check authentication when route changes
  useEffect(() => {
    if (!loading) {
      checkAuth();
    }
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
        withCredentials: true,
      });
      setIsAuthenticated(true);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
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
      } else {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Failed to verify authentication. Please try again.",
        });
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

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

  if (!isAuthenticated) {
    return null; // Don't render anything if not authenticated
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
