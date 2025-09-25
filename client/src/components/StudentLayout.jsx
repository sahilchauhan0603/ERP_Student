import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

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
          <div className="fixed inset-0 backdrop-blur-sm z-20" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-screen z-30 w-60">
            <StudentSidebar open={true} onToggle={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 cursor-pointer z-40 md:hidden bg-white/90 text-sky-700 p-2 rounded shadow"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

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