import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { BsPersonBadge } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import campusBackground from '../../assets/images/BPIT.png'; // Make sure this path is correct

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
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      scale: 1.03,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

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
      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center py-12 px-4">
        {/* Animated Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Join <span className="text-blue-600">CampusPro</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md">
            Select your role to begin the registration process
          </p>
        </motion.div>

        {/* Registration Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl w-full px-4 mt-28"
        >
          {/* Student Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-200"></div>
            <Link
              to="/registration/student"
              className="relative flex flex-col items-center justify-center p-4 md:p-5 min-w-[220px] max-w-[260px] mx-auto rounded-xl shadow-lg h-full text-center text-gray-700 transition-all duration-300 hover:border-blue-500 border-2 border-black backdrop-blur-[10px]"
              style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)'}}
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
                className="mt-2 text-blue-800 font-semibold inline-flex items-center text-sm"
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
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-teal-600 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-200"></div>
            <Link
              to="/registration/faculty"
              className="relative flex flex-col items-center justify-center p-4 md:p-5 min-w-[220px] max-w-[260px] mx-auto rounded-xl shadow-lg h-full text-center text-gray-700 transition-all duration-300 hover:border-green-500 border-2 border-black backdrop-blur-[10px]"
              style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)'}}
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
                className="mt-2 text-green-800 font-semibold inline-flex items-center text-sm"
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
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-200"></div>
            <Link
              to="/registration/non-teaching-staff"
              className="relative flex flex-col items-center justify-center p-4 md:p-5 min-w-[220px] max-w-[260px] mx-auto rounded-xl shadow-lg h-full text-center text-gray-700 transition-all duration-300 hover:border-purple-500 border-2 border-black backdrop-blur-[10px]"
              style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)'}}
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
                className="mt-2 text-purple-800 font-semibold inline-flex items-center text-sm"
                whileHover={{ x: 5 }}
              >
                Register now <span className="ml-1">→</span>
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default RegistrationPage;