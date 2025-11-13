// src/components/AdminSidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiX, FiChevronDown, FiSettings, FiUser, FiBell } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import AIChat from "../AI/AIChat";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z M3 9l9 5 9-5",
    color: "from-blue-500 to-indigo-600",
    badge: null,
  },
  {
    label: "Student Search",
    path: "/admin/student-search",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    color: "from-purple-500 to-pink-600",
    badge: null,
  },
  {
    label: "All Students",
    path: "/admin/students",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    color: "from-green-500 to-emerald-600",
    badge: null,
  },
  {
    label: "Pending Students",
    path: "/admin/students/pending",
    icon: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "from-yellow-500 to-orange-600",
    badge: "New",
  },
  {
    label: "Approved Students",
    path: "/admin/students/approved",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "from-green-500 to-teal-600",
    badge: null,
  },
  {
    label: "Declined Students",
    path: "/admin/students/declined",
    icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "from-red-500 to-pink-600",
    badge: null,
  },
];

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const { logout } = useAuth();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [loginTime, setLoginTime] = useState("");
  const [sessionDuration, setSessionDuration] = useState("");

  useEffect(() => {
    async function fetchAdminEmail() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAdminEmail(data.email || "Admin");
        } else {
          setAdminEmail("");
        }
      } catch {
        setAdminEmail("");
      }
    }
    fetchAdminEmail();

    // Set login time and start session duration tracking
    let loginTimeStamp = localStorage.getItem('adminLoginTime');
    
    // If no login time exists, set it to current time (user just logged in)
    if (!loginTimeStamp) {
      loginTimeStamp = Date.now().toString();
      localStorage.setItem('adminLoginTime', loginTimeStamp);
    }
    
    const updateTime = () => {
      const loginDate = new Date(parseInt(loginTimeStamp));
      setLoginTime(loginDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
      
      const now = Date.now();
      const sessionStart = parseInt(loginTimeStamp);
      const duration = Math.floor((now - sessionStart) / 1000);
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      setSessionDuration(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    });
    if (result.isConfirmed) {
      // Clear login time on logout
      localStorage.removeItem('adminLoginTime');
      await logout("admin");
    }
  };

  // More compact sidebar classes with glassmorphism effect
  const sidebarClasses = `fixed h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 backdrop-blur-xl border-r border-white/10 text-white w-64 flex flex-col shadow-2xl z-30 transition-all duration-500 ease-out
    ${
      open ? "translate-x-0" : "-translate-x-full"
    } md:translate-x-0 md:static md:z-10`;

  return (
    <>
      {/* Backdrop for mobile with blur effect */}
      {open && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/50 z-20 md:hidden transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}
      <aside className={sidebarClasses}>
        {/* Compact Logo/Branding */}
        <div className="px-4 py-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                Admin Portal
              </h1>
              <p className="text-xs text-blue-200/70 font-medium">BPIT Management</p>
            </div>
          </div>
        </div>
        {/* Compact Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center px-3 py-3 rounded-xl transition-all duration-300 ease-out transform hover:scale-[0.98] ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg backdrop-blur-sm border border-white/10"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              onClick={onClose}
            >
              {/* Icon with gradient background */}
              <div
                className={`relative mr-3 p-2 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? `bg-gradient-to-br ${item.color} shadow-lg`
                    : "bg-white/5 group-hover:bg-white/10"
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-all duration-300 ${
                    location.pathname === item.path
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
              </div>
              
              {/* Label and badge */}
              <div className="flex-1 relative">
                <span className={`font-medium text-sm transition-all duration-300 ${
                  location.pathname === item.path ? "text-white" : "text-slate-300 group-hover:text-white"
                }`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              
              {/* Active indicator */}
              {location.pathname === item.path && (
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
          
          {/* Compact Section divider */}
          <div className="my-3 mx-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </nav>

        {/* Compact AI Assistant Button */}
        <div className="px-3 mb-3">
          <button
            onClick={() => setIsAIChatOpen(true)}
            title="AI Assistant - Get instant help"
            className="group relative w-full cursor-pointer flex items-center px-3 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/20 text-purple-200 hover:from-purple-600/30 hover:to-pink-600/30 hover:border-purple-400/30 hover:text-white transition-all duration-300 transform hover:scale-[0.98] shadow-lg"
          >
            {/* AI Icon with pulsing effect */}
            <div className="relative mr-3 p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              {/* Pulsing dot */}
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Text content */}
            <div className="flex-1 text-left">
              <span className="font-medium text-sm block">AI Assistant</span>
              <span className="text-xs text-purple-300/70">Ask me anything!</span>
            </div>
            
            {/* Arrow indicator */}
            <div className="text-purple-300 group-hover:text-white transition-colors duration-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Compact User Profile and Logout */}
        <div className="px-3 py-4 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-blue-900/50 backdrop-blur-sm">
          {/* Compact Admin Profile Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/10 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              {/* Compact Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {adminEmail ? adminEmail.charAt(0).toUpperCase() : "A"}
                </div>
                {/* Online status indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
              </div>
              
              {/* Compact User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <p className="font-bold text-white text-sm">Admin</p>
                  {/* <span className="px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 rounded-md border border-blue-500/20">
                    Super
                  </span> */}
                </div>
                <p className="text-xs text-slate-300 break-all leading-tight">
                  {adminEmail || "admin@bpit.ac.in"}
                </p>
              </div>
              
              
            </div>
            
            {/* Real-time stats */}
            <div className="flex space-x-1.5">
              <div className="flex-1 bg-green-500/10 rounded-lg p-1.5 text-center border border-green-500/20">
                <div className="text-xs font-bold text-green-400">Online</div>
                <div className="text-xs text-green-300">{loginTime}</div>
              </div>
              <div className="flex-1 bg-blue-500/10 rounded-lg p-1.5 text-center border border-blue-500/20">
                <div className="text-xs font-bold text-blue-400">Session</div>
                <div className="text-xs text-blue-300">{sessionDuration}</div>
              </div>
            </div>
          </div>
          
          {/* Compact Logout Button */}
          <button
            onClick={handleLogout}
            className="group w-full cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <FiLogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span>Logout</span>
          </button>
          
          {/* Compact Footer info */}
          {/* <div className="mt-3 text-center">
            <p className="text-xs text-slate-400">v1.0.0 • © BPIT</p>
          </div> */}
        </div>
      </aside>

      {/* AI Chat Modal */}
      {isAIChatOpen && (
        <div className="fixed right-0 top-0 z-50 shadow-lg">
          <AIChat onClose={() => setIsAIChatOpen(false)} />
        </div>
      )}
    </>
  );
}
