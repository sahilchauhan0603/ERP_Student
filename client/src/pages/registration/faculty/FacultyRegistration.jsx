import React from 'react';
import ProgressBar from '../../../components/ProgressBar';

const FacultyRegistration = () => {
  const steps = [
    { label: 'Personal', component: <div>Faculty Personal Info Form</div> },
    { label: 'Professional', component: <div>Faculty Professional Info Form</div> },
    { label: 'Documents', component: <div>Faculty Documents Upload</div> },
    { label: 'Review', component: <div>Faculty Review Info</div> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Faculty Registration</h1>
        </div>
        
        <ProgressBar steps={steps} currentStep={0} />
        
        <div className="bg-white shadow rounded-lg p-6">
          {/* Faculty registration form would go here */}
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold">Faculty Registration Form</h2>
            <p className="mt-2 text-gray-600">This page will contain the faculty registration form</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyRegistration;