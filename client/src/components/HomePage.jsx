import React, { useState, useEffect } from "react";
import CustomModal from "./CustomModal";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaClipboardList, FaSearch } from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
import { FiLogIn } from "react-icons/fi";
import campusBackground from '../assets/images/BPIT.png'; // Make sure this path is correct

const HomePage = () => {
  // const [showResult, setShowResult] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [popupEmail, setPopupEmail] = useState("");

  useEffect(() => {
    // Check localStorage for registration popup
    const popupData = localStorage.getItem('showLoginPopup');
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
      localStorage.removeItem('showLoginPopup');
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
      bgColor: "bg-blue-100"
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
      bgColor: "bg-indigo-100"
    },
    {
      href: "/admin",
      icon: <FaSearch className="text-5xl" />,
      label: "Admin Login",
      color: "from-purple-800 to-purple-900",
      bgColor: "bg-purple-100"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      scale: 1.01,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        background: `
          linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
          url(${campusBackground}) center/cover fixed no-repeat
        `,
        minHeight: '100vh'
      }}
    >
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
      {/* Header */}
      <motion.header 
        className="text-center my-12 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={loaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Bhagwan Parshuram Institute of Technology
        </h1>
        <motion.h2 
          className="text-lg md:text-xl text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          PSP-4, Sec-17, Rohini, Delhi-89
        </motion.h2>
      </motion.header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 mt-28">
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-3xl"
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
                <div className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-200`}></div>
                <div className="relative flex flex-col items-center justify-center h-full p-4 md:p-5 min-w-[220px] max-w-[260px] mx-auto rounded-xl shadow-lg transition-all duration-300 hover:border-blue-500 border-2 border-black backdrop-blur-[6px]" style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)'}}>
                  <div className={`p-2 rounded-full ${item.bgColor} bg-opacity-60 mb-2`}>
                    {React.cloneElement(item.icon, { className: `text-3xl ${item.icon.props.className}` })}
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-gray-800">{item.label}</h2>
                  {/* Optionally add a short description here for consistency */}
                </div>
              </motion.div>
            );

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block h-full"
                >
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