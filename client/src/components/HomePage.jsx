import React, { useState, useEffect } from "react";
import { FaRobot } from "react-icons/fa";
import CustomModal from "./CustomModal";
import AIChatLauncher from "./AI/AIChatLauncher";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaClipboardList,
  FaSearch,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
import { FiLogIn } from "react-icons/fi";
import campusBackground from "../assets/images/BPIT.png";
import bpitLogo from "../assets/icons/BPIT-logo-transparent.png";

const HomePage = () => {
  // const [showResult, setShowResult] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [popupEmail, setPopupEmail] = useState("");
  const [newsData, setNewsData] = useState({
    totalStudents: 0,
    pendingApplications: 0,
    approvedStudents: 0,
  });
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for registration popup
    const popupData = localStorage.getItem("showLoginPopup");
    if (popupData) {
      try {
        const parsed = JSON.parse(popupData);
        if (parsed.show) {
          setShowLoginPopup(true);
          setPopupEmail(parsed.email || "");
        }
      } catch (e) {
        // Failed to parse popup data from localStorage
      }
      // Remove so it doesn't show again
      localStorage.removeItem("showLoginPopup");
    }

    // Fetch news/statistics data
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    try {
      setNewsLoading(true);

      // Try to fetch actual data from backend
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/student/stats`,
          {
            timeout: 5000,
          }
        );

        if (response.data && response.data.success) {
          setNewsData({
            totalStudents: response.data.total || 0,
            pendingApplications: response.data.pending || 0,
            approvedStudents: response.data.approved || 0,
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (apiError) {
        console.log("API not available, using mock data:", apiError.message);
        // Fallback to mock data if API is not available
        setNewsData({
          totalStudents: 1247,
          pendingApplications: 43,
          approvedStudents: 1089,
        });
      }

      setNewsLoading(false);
    } catch (error) {
      console.error("Failed to fetch news data:", error);
      // Final fallback
      setNewsData({
        totalStudents: 0,
        pendingApplications: 0,
        approvedStudents: 0,
      });
      setNewsLoading(false);
    }
  };

  // Chatbot popup state
  const [showChatbot, setShowChatbot] = useState(false);
  // Close chatbot on outside click
  useEffect(() => {
    if (!showChatbot) return;
    function handleClick(e) {
      const box = document.getElementById("ai-chatbot-popup");
      if (box && !box.contains(e.target)) setShowChatbot(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showChatbot]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    {
      href: "/registration/student",
      icon: <FaClipboardList className="text-5xl" />,
      label: "Student Registration",
      color: "from-blue-800 to-blue-900",
      bgColor: "bg-blue-100",
    },
    // {
    //   action: () => setShowResult(true),
    //   icon: <MdVerifiedUser className="text-5xl" />,
    //   label: "View Result",
    //   color: "from-green-500 to-green-600",
    //   bgColor: "bg-green-100"
    // },
    {
      href: "/login",
      icon: <FiLogIn className="text-5xl" />,
      label: "Student Login",
      color: "from-green-800 to-green-900",
      bgColor: "bg-indigo-100",
    },
    {
      href: "/admin",
      icon: <FaSearch className="text-5xl" />,
      label: "Admin Login",
      color: "from-purple-800 to-purple-900",
      bgColor: "bg-purple-100",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      y: -10,
      scale: 1.01,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div
      className="min-h-screen flex flex-col relative bg-gradient-to-br from-white via-blue-50 to-red-50"
      style={{
        background: `
          linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)),
          url(${campusBackground}) center/cover fixed no-repeat
        `,
        minHeight: "100vh",
      }}
    >
      {/* Social Media Bar - Fixed Right */}
      <div className="fixed top-3/5 right-0 z-40 flex flex-col items-end gap-2 -translate-y-1/2 pr-1">
        <a
          href="https://twitter.com/bpitindia"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white shadow-md bg-[#1da1f2] hover:bg-[#0d8ddb] transition-colors duration-200 w-12 h-12 flex items-center justify-center mb-1"
        >
          <FaTwitter className="text-white text-2xl" />
        </a>
        <a
          href="https://www.linkedin.com/company/bhagwan-parshuram-institute-of-technology/?lipi=urn%3Ali%3Apage%3Ad_flagship3_search_srp_all%3Boc8pjvY5TNWSbh6X8JuY6w%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white shadow-md bg-[#0077b5] hover:bg-[#005983] transition-colors duration-200 w-12 h-12 flex items-center justify-center mb-1"
        >
          <FaLinkedinIn className="text-white text-2xl" />
        </a>
        <a
          href="https://www.youtube.com/@bpitcampus"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white shadow-md bg-[#ff0000] hover:bg-[#b80000] transition-colors duration-200 w-12 h-12 flex items-center justify-center mb-1"
        >
          <FaYoutube className="text-white text-2xl" />
        </a>
        <a
          href="https://www.instagram.com/bpitindia/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white shadow-md bg-[#c32aa3] hover:bg-[#a21c7a] transition-colors duration-200 w-12 h-12 flex items-center justify-center"
        >
          <FaInstagram className="text-white text-2xl" />
        </a>
      </div>
      <CustomModal
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        title="Registration Complete!"
        message={
          popupEmail
            ? `You can now login using your email ID: ${popupEmail}`
            : "You can now login using your email ID given during registration."
        }
        type="success"
        duration={3500}
      />

      {/* BPIT Modern Header */}
      <header className="w-full bg-gradient-to-r from-red-50 to-red-50 backdrop-blur-sm border-b border-gray-200 shadow-xl relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Desktop Layout - Horizontal */}
          <div className="hidden sm:flex items-center justify-between">
            {/* Logo and Institution Info */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="h-20 rounded-2xl p-2 shadow-sm border border-blue-200 hover:shadow-md transition-shadow duration-200">
                  <img
                    src={bpitLogo}
                    alt="BPIT Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Institution Text */}
              <div className="border rounded-2xl border-gray-300 bg-white/50 backdrop-blur-sm p-1 pl-8 pr-44 relative border-r-4 border-r-gradient-to-b border-r-blue-600 shadow-sm">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-red-500 to-blue-600 rounded-r-xl"></div>
                <h1 className="text-xl md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                  <span className="bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                    Bhagwan Parshuram Institute of Technology
                  </span>
                </h1>
                <div className="flex flex-col mt-1 space-y-0.5">
                  <p className="text-sm md:text-base text-red-600 font-semibold">
                    A Unit of Bhartiya Brahmin Charitable Trust (Regd.)
                  </p>
                  <div className="text-xs md:text-sm text-gray-600 space-y-0.5">
                    <p>
                      (Approved by AICTE, Ministry of Education) • Affiliated to
                      GGSIPU, Delhi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Accreditation Logo */}
            <div className="flex-shrink-0">
              <div className="h-20 rounded-3xl border border-gray-200 shadow-md hover:shadow-md transition-shadow duration-200">
                <img
                  src="https://bpitindia.ac.in/wp-content/uploads/2024/03/Header-1-1-300x88-1.jpg"
                  alt="G20 & Accreditation Logos"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Mobile Layout - Logo and Text */}
          <div className="sm:hidden flex flex-col items-center space-y-3">
            {/* BPIT Logo */}
            <div className="flex-shrink-0">
              <div className="h-16 rounded-2xl p-2 shadow-sm border border-blue-200 hover:shadow-md transition-shadow duration-200">
                <img
                  src={bpitLogo}
                  alt="BPIT Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Institution Text */}
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  Bhagwan Parshuram Institute of Technology
                </span>
              </h1>
              <p className="text-sm text-red-600 font-semibold mt-1">
                A Unit of Bhartiya Brahmin Charitable Trust (Regd.)
              </p>
              <p className="text-xs text-gray-600 mt-1">
                (Approved by AICTE, Ministry of Education) <br />
                Affiliated to GGSIPU, Delhi
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Border */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-red-500 to-blue-600"></div>
      </header>

      {/* News Ticker / Announcements */}
      <div className="w-full bg-gradient-to-r from-blue-50 via-white to-red-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          {newsLoading ? (
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-pulse flex space-x-4 w-full max-w-4xl">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
              {/* Exclusive Admin Label */}
              <div className="flex-shrink-0 mr-4">
                <div className="relative">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg border-2 border-red-500 animate-pulse">
                    <span className="flex items-center space-x-1">
                      <span>👑</span>
                      <span>Exclusive for Admins</span>
                      <span>👑</span>
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                </div>
              </div>

              {/* News Ticker */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center space-x-8 animate-scroll">
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🎉 New
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      Students can register now and enjoy advanced portal
                      features, making profile management easier than ever!
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📊 Stats
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {newsData.totalStudents.toLocaleString()} students
                      registered • {newsData.approvedStudents.toLocaleString()}{" "}
                      approved
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      ⚡ Live
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {newsData.pendingApplications} applications under review •
                      AI-powered verification system active
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-4 md:ml-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {newsData.totalStudents.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Students</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {newsData.approvedStudents.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Approved</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {newsData.pendingApplications}
                  </div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-2 sm:px-4 mt-8 md:mt-10 mb-12">
        <motion.div
          className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full max-w-xs xs:max-w-2xl md:max-w-4xl xl:max-w-6xl mt-10 sm:mt-16 md:mt-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {menuItems.map((item, index) => {
            const content = (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover="hover"
                className="relative h-full group"
              >
                {/* <div className={`absolute -inset-0 bg-gradient-to-r ${item.color} rounded-xl blur-sm opacity-10 group-hover:opacity-40 transition duration-200`}></div> */}
                <div
                  className="relative flex flex-col items-center justify-center h-full p-4 md:p-6 min-w-[160px] max-w-[260px] w-full mx-auto rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-blue-500 border-2 border-blue-800/80 backdrop-blur-[12px] focus:outline-none focus:ring-1 focus:ring-blue-300"
                  style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
                  tabIndex={0}
                >
                  <div
                    className={`p-2 rounded-full ${item.bgColor} bg-opacity-60 mb-2 border-2 border-blue-200/60`}
                  >
                    {React.cloneElement(item.icon, {
                      className: `text-3xl ${item.icon.props.className}`,
                    })}
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-black drop-shadow-sm">
                    {item.label}
                  </h2>
                </div>
              </motion.div>
            );

            if (item.href) {
              return (
                <Link key={item.label} to={item.href} className="block h-full">
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                onClick={item.action}
                className="block h-full focus:outline-none"
              >
                {content}
              </button>
            );
          })}
        </motion.div>
      </main>

      {/* AI Chat - reusable launcher */}
      <AIChatLauncher />

      {/* Custom CSS for animations */}
      <style jsx="true">{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
