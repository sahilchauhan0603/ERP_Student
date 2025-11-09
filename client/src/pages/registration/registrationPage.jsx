import React, { useState, useEffect } from "react";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { BsPersonBadge } from "react-icons/bs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome } from "react-icons/fi";
import campusBackground from "../../assets/images/BPIT.png"; // Make sure this path is correct
import bpitLogo from "../../assets/icons/BPIT-logo-transparent.png";
import AIChatLauncher from "../../components/AI/AIChatLauncher"; // adjust path as needed

const RegistrationPage = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      y: -10,
      scale: 1.03,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
  };

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

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: `
          linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
          url(${campusBackground}) center/cover fixed no-repeat
        `,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
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
      <main className="flex-1 w-full flex flex-col items-center py-12 px-4">
        {/* Registration Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl w-full px-4 mt-28"
        >
          {/* Student Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="relative"
          >
            <div className="absolute -inset-1 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-200"></div>
            <Link
              to="/registration/student"
              className="relative flex flex-col items-center justify-center p-4 md:p-5 min-w-[220px] max-w-[260px] mx-auto rounded-xl shadow-lg h-full text-center text-gray-700 transition-all duration-300 hover:border-blue-500 border-2 border-black backdrop-blur-[10px]"
              style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
            >
              <div className="p-2 rounded-full bg-blue-50 bg-opacity-60 mb-2">
                <FaUserGraduate className="text-3xl text-blue-600" />
              </div>
              <h2 className="mt-2 text-lg font-extrabold text-gray-800">
                Student Registration
              </h2>
              <p className="mt-1 text-gray-900 font-bold text-sm">
                Join as a student to access all campus resources
              </p>
              <motion.span
                className="mt-2 text-black font-extrabold inline-flex items-center text-sm"
                whileHover={{ x: 5 }}
              >
                Register now <span className="ml-1">→</span>
              </motion.span>
            </Link>
          </motion.div>

          {/* Faculty Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="relative"
          >
            <div className="absolute -inset-1 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-200"></div>
            <Link
              to="/registration/faculty"
              className="relative flex flex-col items-center justify-center p-4 md:p-5 min-w-[220px] max-w-[260px] mx-auto rounded-xl shadow-lg h-full text-center text-gray-700 transition-all duration-300 hover:border-green-500 border-2 border-black backdrop-blur-[10px]"
              style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
            >
              <div className="p-2 rounded-full bg-green-50 bg-opacity-60 mb-2">
                <FaChalkboardTeacher className="text-3xl text-green-600" />
              </div>
              <h2 className="mt-2 text-lg font-extrabold text-gray-800">
                Faculty Registration
              </h2>
              <p className="mt-1 text-gray-900 font-bold text-sm">
                Join as faculty to manage courses and students
              </p>
              <motion.span
                className="mt-2 text-black font-extrabold inline-flex items-center text-sm"
                whileHover={{ x: 5 }}
              >
                Register now <span className="ml-1">→</span>
              </motion.span>
            </Link>
          </motion.div>

          {/* Staff Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="relative"
          >
            <div className="absolute -inset-1 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-200"></div>
            <Link
              to="/registration/non-teaching-staff"
              className="relative flex flex-col items-center justify-center p-4 md:p-5 min-w-[220px] max-w-[260px] mx-auto rounded-xl shadow-lg h-full text-center text-gray-700 transition-all duration-300 hover:border-purple-500 border-2 border-black backdrop-blur-[10px]"
              style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
            >
              <div className="p-2 rounded-full bg-purple-50 bg-opacity-60 mb-2">
                <BsPersonBadge className="text-3xl text-purple-600" />
              </div>
              <h2 className="mt-2 text-lg font-extrabold text-gray-800">
                Staff Registration
              </h2>
              <p className="mt-1 text-gray-900 font-bold text-sm">
                Join as non-teaching staff to access admin features
              </p>
              <motion.span
                className="mt-2 text-black font-extrabold inline-flex items-center text-sm"
                whileHover={{ x: 5 }}
              >
                Register now <span className="ml-1">→</span>
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Persistent Home Navigation Button */}
      {/* <button
        onClick={() => (window.location.href = "/")}
        className="fixed bottom-6 right-24 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
        // title="Go to Homepage"
      >
        <FiHome className="w-8 h-8" />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Go to Homepage
        </div>
      </button> */}

      <AIChatLauncher />
    </div>
  );
};

export default RegistrationPage;
