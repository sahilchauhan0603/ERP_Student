import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only show unauthorized message if not loading and not authenticated
    if (!loading && (!isAuthenticated || userRole !== 'student')) {
      // Don't show the message if we're already on the login page
      if (location.pathname !== '/login') {
        Swal.fire({
          icon: "error",
          title: "Unauthorized Access",
          text: "This page can only be accessed by authenticated students. Please log in as a student.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate('/login');
        });
      }
    }
  }, [isAuthenticated, userRole, loading, navigate, location.pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-sky-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or wrong role
  if (!isAuthenticated || userRole !== 'student') {
    return null;
  }

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden md:block">
        <div className="fixed left-0 top-0 h-screen z-30">
          <StudentSidebar open={sidebarOpen} onToggle={setSidebarOpen} />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-20" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-screen z-30 w-60">
            <StudentSidebar open={true} onToggle={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Hamburger for mobile - hide when sidebar is open */}
      {!mobileOpen && (
        <button
          className="fixed top-4 left-4 cursor-pointer z-40 md:hidden bg-white/90 text-sky-700 p-2 rounded shadow"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Content area - offset by sidebar width on md+; no gap when collapsed */}
      <div className={`min-h-screen h-screen overflow-y-auto to-white text-slate-900 transition-all duration-300 ${sidebarOpen ? "md:ml-60" : "md:ml-16"}`}>
        <div className="relative">
          <div className="absolute inset-0 pointer-events-none" />
          <div className="mx-autorelative z-10">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}