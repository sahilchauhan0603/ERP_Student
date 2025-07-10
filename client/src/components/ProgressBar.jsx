import React from 'react';

const ProgressBar = ({ steps, currentStep }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                  ${index === currentStep ? 'ring-4 ring-blue-300' : ''}`}
              >
                {index + 1}
              </div>
              <span className={`text-sm mt-2 ${index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-auto border-t-2 ${index < currentStep ? 'border-blue-600' : 'border-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;