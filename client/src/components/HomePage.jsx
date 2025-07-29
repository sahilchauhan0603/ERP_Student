import React, { useState, useEffect } from "react";
import CustomModal from "./CustomModal";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
        console.error("Failed to parse popup data from localStorage", e);
      }
      // Remove so it doesn't show again
      localStorage.removeItem("showLoginPopup");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    {
      href: "/registration",
      icon: <FaClipboardList className="text-5xl" />,
      label: "Registration",
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
      <div className="fixed top-3/4 right-0 z-40 flex flex-col items-end gap-2 -translate-y-1/2 pr-1">
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
      {/* BPIT Official Header - Enhanced */}
      <header
        className="w-full bg-white border-t-4 border-b-4 border-red-500 shadow-lg flex flex-col md:flex-row items-center justify-between px-2 md:px-10 py-3 relative z-20"
        style={{ minHeight: 100, borderRadius: "0 0 1.5rem 1.5rem" }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full md:w-auto">
          <div className="flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-1 md:p-2 shadow-sm border border-blue-200">
            <img
              src={bpitLogo}
              alt="BPIT Logo"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-md"
              style={{ minWidth: 56 }}
            />
          </div>
          <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left w-full">
            <h1
              className="text-lg xs:text-xl md:text-3xl font-extrabold text-blue-900 leading-tight tracking-tight drop-shadow-sm"
              style={{ fontFamily: "serif", letterSpacing: 0.5 }}
            >
              Bhagwan Parshuram Institute of Technology
            </h1>
            <div
              className="text-sm xs:text-base md:text-lg font-bold text-red-600 leading-tight mt-0.5 md:mt-1"
              style={{ fontFamily: "serif", letterSpacing: 0.2 }}
            >
              <span className="tracking-wide">
                A Unit of Bhartiya Brahmin Charitable Trust (Regd.)
              </span>
            </div>
            <div
              className="text-xs md:text-sm text-blue-700 font-medium mt-0.5 md:mt-1"
              style={{ fontFamily: "serif" }}
            >
              <span className="block">
                (Approved by AICTE, Ministry of Education (MoE))
              </span>
              <span className="block">
                Affiliated to Guru Gobind Singh Indraprastha University, Delhi
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 md:mt-0 md:ml-4">
          <img
            src="https://bpitindia.ac.in/wp-content/uploads/2024/03/Header-1-1-300x88-1.jpg"
            alt="G20 Logo"
            className="h-16 sm:h-20 md:h-24 w-auto object-contain bg-white rounded-lg border border-blue-100 shadow-sm p-1"
            style={{ minWidth: 40 }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-2 sm:px-4 mt-8 md:mt-10">
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
    </div>
  );
};

export default HomePage;
