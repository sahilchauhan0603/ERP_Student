import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiHelpCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useStudentData } from "../../context/StudentDataContext";
import Swal from "sweetalert2";
import AIChat from "../AI/AIChat";

const navItems = [
  {
    label: "Dashboard",
    path: "/student/me",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z M3 9l9 5 9-5",
    color: "from-blue-500 to-indigo-600",
    badge: null,
  },
  {
    label: "SAR Booklet",
    path: "/student/sar",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    color: "from-green-500 to-emerald-600",
    badge: null,
  },
];

export default function StudentSidebar({ open = true, onToggle, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { studentData } = useStudentData(); // Use shared context
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loginTime, setLoginTime] = useState("");
  const [sessionDuration, setSessionDuration] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update studentInfo when studentData from context changes
  useEffect(() => {
    if (studentData) {
      const personalInfo = studentData.personal || {};
      if (studentData.documents?.photo) {
        personalInfo.photo = studentData.documents.photo;
      }
      setStudentInfo(personalInfo);
    }
  }, [studentData]);

  useEffect(() => {
    // Set login time and start session duration tracking
    let loginTimeStamp = localStorage.getItem('studentLoginTime');
    
    // If no login time exists, set it to current time (user just logged in)
    if (!loginTimeStamp) {
      loginTimeStamp = Date.now().toString();
      localStorage.setItem('studentLoginTime', loginTimeStamp);
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
      try {
        // Clear login time on logout
        localStorage.removeItem('studentLoginTime');
        await logout("student");
        navigate("/login");
      } catch (e) {}
    }
  };

  const handleHelp = () => {
    navigate("/student/help");
    if (onClose && isMobile) onClose();
  };

  // Modern sidebar classes with glassmorphism effect
  const sidebarClasses = `fixed h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 backdrop-blur-xl border-r border-white/10 text-white flex flex-col shadow-2xl z-30 transition-all duration-500 ease-out
    ${
      open ? "w-60 translate-x-0" : "w-16 translate-x-0"
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
        {/* Header with Toggle Button */}
        <div className="px-4 py-4 border-b border-white/10 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 p-2 rounded-lg shadow-lg">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              {open && (
                <div>
                  <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-green-200 to-blue-200 bg-clip-text text-transparent">
                    Student Portal
                  </h1>
                  <p className="text-xs text-green-200/70 font-medium">BPIT Dashboard</p>
                </div>
              )}
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={() => onToggle && onToggle(!open)}
              title={open ? "Collapse" : "Expand"}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              className="w-8 h-8 cursor-pointer rounded-lg border border-white/20 bg-gray-300 hover:bg-white/20 transition-all duration-200 flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg"
            >
              {open ? (
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Compact Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={`group relative flex items-center px-3 py-3 rounded-xl transition-all duration-300 ease-out transform hover:scale-[0.98] ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-green-500/20 to-blue-500/20 text-white shadow-lg backdrop-blur-sm border border-white/10"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              } ${!open ? "justify-center" : ""}`}
              onClick={() => isMobile && onClose && onClose()}
            >
              {/* Icon with gradient background */}
              <div
                className={`relative p-2 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? `bg-gradient-to-br ${item.color} shadow-lg`
                    : "bg-white/5 group-hover:bg-white/10"
                } ${open ? "mr-3" : ""}`}
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
              {open && (
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
              )}
              
              {/* Active indicator - only show when expanded */}
              {location.pathname === item.path && open && (
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
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
            className={`group relative w-full cursor-pointer flex items-center px-3 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/20 text-purple-200 hover:from-purple-600/30 hover:to-pink-600/30 hover:border-purple-400/30 hover:text-white transition-all duration-300 transform hover:scale-[0.98] shadow-lg ${
              !open ? "justify-center" : ""
            }`}
          >
            {/* AI Icon with pulsing effect */}
            <div className={`relative p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg ${
              open ? "mr-3" : ""
            }`}>
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
            {open && (
              <div className="flex-1 text-left">
                <span className="font-medium text-sm block">AI Assistant</span>
                <span className="text-xs text-purple-300/70">Ask me anything!</span>
              </div>
            )}
            
            {/* Arrow indicator */}
            {open && (
              <div className="text-purple-300 group-hover:text-white transition-colors duration-300">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Help Button */}
        <div className="px-3 mb-3">
          <button
            onClick={handleHelp}
            title="Help & Support"
            className={`group relative w-full cursor-pointer flex items-center px-3 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-yellow-500/20 text-yellow-200 hover:from-yellow-600/30 hover:to-orange-600/30 hover:border-yellow-400/30 hover:text-white transition-all duration-300 transform hover:scale-[0.98] shadow-lg ${
              !open ? "justify-center" : ""
            }`}
          >
            {/* Help Icon */}
            <div className={`relative p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg ${
              open ? "mr-3" : ""
            }`}>
              <FiHelpCircle className="w-4 h-4 text-white" />
            </div>
            
            {/* Text content */}
            {open && (
              <div className="flex-1 text-left">
                <span className="font-medium text-sm block">Help & Support</span>
              </div>
            )}
          </button>
        </div>

        {/* Compact User Profile and Logout */}
        <div className="px-3 py-4 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-green-900/50 backdrop-blur-sm">
          {open ? (
            <>
              {/* Compact Student Profile Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/10 shadow-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {/* Profile Image */}
                  <div className="relative">
                    {(studentInfo?.photo || studentInfo?.profileImage) ? (
                      <img
                        src={studentInfo?.photo || studentInfo?.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-xl object-cover shadow-lg border-2 border-green-400/50"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ${(studentInfo?.photo || studentInfo?.profileImage) ? 'hidden' : 'flex'}`}>
                      {studentInfo?.firstName
                        ? studentInfo.firstName.charAt(0).toUpperCase()
                        : "S"}
                    </div>
                    {/* Online status indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mb-1">
                      <p className="font-bold text-white text-sm truncate">
                        {studentInfo?.firstName || "Student"} {studentInfo?.lastName || ""}
                      </p>
                      {/* <span className="px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-200 rounded-md border border-green-500/20">
                        Active
                      </span> */}
                    </div>
                    {/* Full email display with proper wrapping */}
                    <p className="text-xs text-slate-300 break-all leading-tight">
                      {studentInfo?.email || "student@bpit.ac.in"}
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
            </>
          ) : (
            <>
              {/* Collapsed Avatar */}
              <div className="flex justify-center mb-3">
                <div className="relative">
                  {(studentInfo?.photo || studentInfo?.profileImage) ? (
                    <img
                      src={studentInfo?.photo || studentInfo?.profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-xl object-cover shadow-lg border-2 border-green-400/50"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ${(studentInfo?.photo || studentInfo?.profileImage) ? 'hidden' : 'flex'}`}>
                    {studentInfo?.firstName
                      ? studentInfo.firstName.charAt(0).toUpperCase()
                      : "S"}
                  </div>
                  {/* Online status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
                </div>
              </div>
              
              {/* Collapsed Logout Button */}
              <button
                onClick={handleLogout}
                title="Logout"
                className="group w-full cursor-pointer flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <FiLogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </>
          )}
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