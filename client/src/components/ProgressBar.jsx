import React from 'react';

const ProgressBar = ({ steps, currentStep }) => {
  // Function to get abbreviated label for small screens
  const getAbbreviatedLabel = (label) => {
    const abbreviations = {
      'Instructions': 'Inst',
      'Personal Info': 'P.I',
      'Academics': 'Accd.',
      'Parents Info': 'Par.I',
      'Documents': 'Docs',
      'Review': 'Rev'
    };
    return abbreviations[label] || label;
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center min-w-0 flex-1 group relative focus-within:z-20">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-md
                  ${index < currentStep ? 'bg-gray-900 text-white shadow-lg' : 
                    index === currentStep ? 'bg-black text-white ring-4 ring-gray-400 shadow-xl' : 
                    'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
              >
                {index < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <button
                type="button"
                tabIndex={0}
                className={`text-xs sm:text-sm mt-2 text-center px-1 transition-colors duration-300 ${
                  index < currentStep ? 'text-black font-semibold' : 
                  index === currentStep ? 'text-black font-bold' : 
                  'text-gray-500 hover:text-gray-700'
                } break-words cursor-help bg-transparent border-none outline-none focus:outline-none`}
                aria-label={step.label}
              >
                {/* Show abbreviated text on small screens, full text on larger screens */}
                <span className="block sm:hidden">{getAbbreviatedLabel(step.label)}</span>
                <span className="hidden sm:block">{step.label}</span>
              </button>
              {/* Tooltip for hover and focus */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {step.label}
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                index < currentStep ? 'bg-black shadow-sm' : 'bg-gray-200'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;