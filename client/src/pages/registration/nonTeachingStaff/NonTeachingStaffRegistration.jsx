import React from 'react';
import ProgressBar from '../../../components/ProgressBar';

const NonTeachingStaffRegistration = () => {
  const steps = [
    { label: 'Personal', component: <div>Staff Personal Info Form</div> },
    { label: 'Employment', component: <div>Staff Employment Info Form</div> },
    { label: 'Documents', component: <div>Staff Documents Upload</div> },
    { label: 'Review', component: <div>Staff Review Info</div> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Non-Teaching Staff Registration</h1>
        </div>
        
        <ProgressBar steps={steps} currentStep={0} />
        
        <div className="bg-white shadow rounded-lg p-6">
          {/* Staff registration form would go here */}
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold">Staff Registration Form</h2>
            <p className="mt-2 text-gray-600">This page will contain the staff registration form</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonTeachingStaffRegistration;