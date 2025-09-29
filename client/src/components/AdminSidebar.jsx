// src/components/AdminSidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import AIChat from "./AIChat";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    label: "All Students",
    path: "/admin/students",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    label: "Pending Students",
    path: "/admin/students/pending",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Approved Students",
    path: "/admin/students/approved",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Declined Students",
    path: "/admin/students/declined",
    icon: "M6 18L18 6M6 6l12 12",
  },
];

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const { logout } = useAuth();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

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
      await logout("admin");
    }
  };

  // Responsive sidebar classes
  const sidebarClasses = `fixed h-screen bg-gradient-to-b from-blue-800 to-blue-600 text-white w-64 flex flex-col shadow-xl z-30 transition-transform duration-300
    ${
      open ? "translate-x-0" : "-translate-x-full"
    } md:translate-x-0 md:static md:z-10`;

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/40 bg-opacity-40 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}
      <aside className={sidebarClasses}>
        {/* Logo/Branding */}
        <div className="px-6 py-5 border-b border-blue-700 flex justify-center items-center space-x-3">
          {/* <div className="bg-white p-2 rounded-lg">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
          </div> */}
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-200 group ${
                location.pathname === item.path
                  ? "bg-blue-900 text-white shadow-md"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
              onClick={onClose}
            >
              <span
                className={`mr-3 p-1.5 rounded-lg ${
                  location.pathname === item.path
                    ? "bg-blue-700 text-white"
                    : "bg-blue-900/30 text-blue-200 group-hover:bg-blue-700/50"
                }`}
              >
                <svg
                  className="w-5 h-5"
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
              </span>
              <span className="font-medium">{item.label}</span>
              {location.pathname === item.path && (
                <span className="ml-auto w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* AI Chatbot Button */}
        <button
          onClick={() => setIsAIChatOpen(true)}
          title="AI Assistant"
          className={`flex items-center cursor-pointer px-3 py-3 rounded-lg mx-2 transition-all duration-200 group mb-2 text-blue-100 hover:bg-blue-700 hover:text-white`}
        >
          <span
            className={`mr-3 p-1.5 rounded-lg bg-blue-900 text-blue-200 group-hover:bg-blue-900`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3.5 5.5V17a2 2 0 01-2 2h-1a2 2 0 01-2-2v-2.5C6.5 13.5 5 11.5 5 9a7 7 0 017-7zm0 0v2m0 0a5 5 0 00-5 5c0 1.5.5 2.5 1.5 3.5M12 4a5 5 0 015 5c0 1.5-.5 2.5-1.5 3.5M12 17v2"
              />
            </svg>
          </span>
          <span className="font-medium">AI Assistant</span>
        </button>

        {/* User Profile and Logout */}
        <div className="px-4 py-5 border-t border-blue-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 font-bold">
              {adminEmail ? adminEmail.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <p className="font-medium text-white">Admin User</p>
              <p className="text-xs text-blue-200 break-all">
                {adminEmail ? adminEmail : "No email found"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <FiLogOut /> Logout
          </button>
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
