import React, { useState, useEffect } from "react";
import SARContainer from "./sar/SARContainer";
import { FaExclamationTriangle, FaHourglassHalf, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { useStudentData } from "../../context/StudentDataContext";

export default function SARBooklet() {
  const { studentData, loading: contextLoading } = useStudentData();
  const [studentStatus, setStudentStatus] = useState(null);

  // Update student status from context data
  useEffect(() => {
    if (studentData) {
      const status = studentData?.personal?.status || 'pending';
      setStudentStatus(status);
    }
  }, [studentData]);

  // Loading state
  if (contextLoading || studentStatus === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading SAR Booklet...</p>
        </div>
      </div>
    );
  }

  // Check if student is approved
  if (studentStatus !== 'approved') {
    const statusConfig = {
      pending: {
        icon: FaHourglassHalf,
        iconColor: 'text-yellow-500',
        bgGradient: 'from-yellow-50 via-white to-orange-50',
        borderColor: 'border-yellow-200',
        title: 'Profile Approval Pending',
        message: 'Your profile has not been approved yet. SAR functionality is not accessible until your profile is approved by the admin.',
        iconBg: 'bg-yellow-100',
      },
      declined: {
        icon: FaTimesCircle,
        iconColor: 'text-red-500',
        bgGradient: 'from-red-50 via-white to-pink-50',
        borderColor: 'border-red-200',
        title: 'Profile Declined',
        message: 'Your profile has been declined. SAR functionality is not accessible. Please contact the admin for more information.',
        iconBg: 'bg-red-100',
      },
    };

    const config = statusConfig[studentStatus] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-4`}>
        <div className="max-w-2xl w-full">
          <div className={`bg-white rounded-2xl shadow-2xl border-2 ${config.borderColor} p-8 md:p-12`}>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`${config.iconBg} rounded-full p-6 shadow-lg`}>
                <Icon className={`w-16 h-16 ${config.iconColor}`} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">
              {config.title}
            </h1>

            {/* Message */}
            <p className="text-gray-600 text-center text-lg mb-8 leading-relaxed">
              {config.message}
            </p>

            {/* Info Box */}
            <div className={`bg-gradient-to-r ${config.bgGradient} border-l-4 ${config.borderColor} p-4 rounded-lg mb-6`}>
              <div className="flex items-start">
                <FaExclamationTriangle className={`${config.iconColor} mt-1 mr-3 flex-shrink-0`} />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">What you can do:</p>
                  <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                    {studentStatus === 'pending' ? (
                      <>
                        <li>Wait for admin approval</li>
                        <li>Ensure all required information is submitted</li>
                        <li>Check back later for status updates</li>
                      </>
                    ) : (
                      <>
                        <li>Contact the admin for clarification</li>
                        <li>Review and update your profile information if needed</li>
                        <li>Resubmit your profile for approval</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.href = '/student/help'}
                className={`px-6 py-3 cursor-pointer bg-gradient-to-r ${studentStatus === 'pending' ? 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'} text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105`}
              >
                Contact Support
              </button>
            </div>

            {/* Status Badge */}
            <div className="mt-8 text-center">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                studentStatus === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                Status: {studentStatus.charAt(0).toUpperCase() + studentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If approved, show SAR Container
  return <SARContainer />;
}
