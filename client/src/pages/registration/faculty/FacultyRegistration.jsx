import React from 'react';
import ProgressBar from '../../../components/ProgressBar';
import { FiClock, FiBook, FiUser, FiFileText, FiCheckCircle } from 'react-icons/fi';

const FacultyRegistration = () => {
  const steps = [
    { label: 'Personal', icon: <FiUser className="mr-2" /> },
    { label: 'Professional', icon: <FiBook className="mr-2" /> },
    { label: 'Documents', icon: <FiFileText className="mr-2" /> },
    { label: 'Review', icon: <FiCheckCircle className="mr-2" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Registration</h1>
          <p className="text-lg text-gray-600">Join our esteemed faculty members</p>
        </div>
        
        <ProgressBar steps={steps} currentStep={0} />
        
        <div className="bg-white shadow-xl rounded-xl overflow-hidden mt-8">
          <div className="p-8 text-center">
            <div className="mx-auto w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <FiClock className="text-blue-600 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Faculty Registration Coming Soon</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're currently preparing the faculty registration portal. Please check back soon for updates.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-800 font-medium">
                For immediate assistance, please contact the administration office.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyRegistration;