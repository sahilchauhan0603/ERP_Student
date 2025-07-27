import React, { useState } from "react";

const Instructions = ({ nextStep }) => {
  const [agree, setAgree] = useState(false);

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-3xl shadow-2xl border border-gray-200 animate-fade-in">
      <div className="text-center mb-8 sm:mb-10">
        <div className="flex justify-center items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <span className="inline-block w-1 sm:w-2 h-8 sm:h-12 bg-gray-800 rounded-full"></span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
            Official Registration Instructions
          </h2>
          <span className="inline-block w-1 sm:w-2 h-8 sm:h-12 bg-gray-800 rounded-full"></span>
        </div>
        <p className="text-base sm:text-lg text-gray-700 font-medium tracking-wide">
          Bhagwan Parshuram Institute of Technology
        </p>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Please read all instructions carefully before proceeding with registration
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border-2 border-gray-200 mb-8 sm:mb-10 transition-all duration-300 hover:shadow-xl">
        <div className="prose max-w-none">
          <div className="bg-gray-100 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border-l-4 border-gray-600">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Important Notice</h3>
                <p className="text-sm sm:text-base text-gray-800 font-medium">
                  This is the official student registration portal of Bhagwan Parshuram Institute of Technology. 
                  All information provided will be verified and must be accurate and complete.
                </p>
              </div>
            </div>
          </div>

          <ol className="space-y-4 sm:space-y-6 list-decimal pl-3 sm:pl-5 marker:text-gray-600 marker:font-bold">
            <li className="pl-2 sm:pl-4 bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="font-semibold text-gray-900 mb-2">Anti-Ragging Compliance</div>
              <p className="text-sm sm:text-base text-gray-700 mb-3">
                Visit the{" "}
                <a
                  href="https://antiragging.in/affidavit_affiliated_form.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 font-medium underline decoration-gray-400 hover:decoration-gray-600 transition-colors"
                >
                  Official Anti-Ragging Website
                </a>{" "}
                and complete the mandatory affidavit form to obtain your reference number. 
                This reference number is required for registration completion.
              </p>
            </li>

            <li className="pl-2 sm:pl-4 bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="font-semibold text-gray-900 mb-2">Document Preparation</div>
              <p className="text-sm sm:text-base text-gray-700 mb-3">
                Prepare the following official documents in PDF/JPEG format (maximum 2MB each):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4">
                {[
                  "Recent Photograph",
                  "IPU Registration Slip",
                  "Allotment Letter",
                  "Entrance Exam Admit Card",
                  "Entrance Exam Score Card",
                  "Class X Marksheet",
                  "Class X Passing Certificate",
                  "Class XII Marksheet",
                  "Class XII Passing Certificate",
                  "Aadhar Card",
                  "Character Certificate",
                  "Medical Certificate",
                  "Migration Certificate",
                  "Category Certificate (if applicable)",
                  "Special Category Certificate (if applicable)",
                  "Academic Fee Receipt",
                  "College Fee Receipt",
                  "Parent's Signature",
                ].map((doc, i) => (
                  <div key={i} className="flex items-start bg-gray-50 p-2 rounded border">
                    <span className="inline-block bg-gray-200 text-gray-600 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </li>

            <li className="pl-2 sm:pl-4 bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="font-semibold text-gray-900 mb-2">Information Accuracy</div>
              <p className="text-sm sm:text-base text-gray-700 mb-3">
                Ensure all personal, academic, and family information is accurate and matches your official documents. 
                Any discrepancies may result in registration rejection or disciplinary action.
              </p>
            </li>

            <li className="pl-2 sm:pl-4 bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="font-semibold text-gray-900 mb-2">Registration Process</div>
              <p className="text-sm sm:text-base text-gray-700 mb-3">
                Complete all six steps in sequence: Instructions, Personal Information, Academic Information, 
                Parent Details, Document Upload, and Final Review. You cannot proceed without completing each step.
              </p>
            </li>

            <li className="pl-2 sm:pl-4 bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="font-semibold text-gray-900 mb-2">Submission & Verification</div>
              <p className="text-sm sm:text-base text-gray-700 mb-3">
                After submission, your registration will be reviewed by the administration. 
                You will receive confirmation via email. Keep your registration number for future reference.
              </p>
            </li>
          </ol>
        </div>
      </div>

      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Declaration</h3>
            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
              By proceeding with registration, you acknowledge that all information provided is true and accurate. 
              You understand that providing false information may result in immediate disqualification and legal action.
            </p>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <label htmlFor="agree" className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                I have read and understood all instructions and agree to proceed with registration
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={nextStep}
          disabled={!agree}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 ${
            agree
              ? "bg-gray-800 hover:bg-black text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {agree ? "Proceed to Registration" : "Please Accept Declaration"}
        </button>
      </div>
    </div>
  );
};

export default Instructions;
