import React, { useState } from "react";

const Instructions = ({ nextStep }) => {
  const [agree, setAgree] = useState(false);

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-2xl shadow-xl border border-gray-300 animate-fade-in">
      <div className="text-center mb-8 sm:mb-10">
        <div className="flex justify-center items-center mb-3 sm:mb-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black tracking-tight">
            Official Registration Instructions
          </h2>
        </div>
        <p className="text-base sm:text-lg text-gray-700 font-semibold tracking-wide">
          Bhagwan Parshuram Institute of Technology
        </p>
        <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">
          Please read all instructions carefully before proceeding with registration
        </p>
      </div>

      <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-300 mb-8 sm:mb-10 transition-all duration-300 hover:shadow-xl animate-slide-in">
        <div className="prose max-w-none">
          <div className="bg-white p-4 sm:p-5 rounded-lg mb-4 sm:mb-6 border-l-4 border-black shadow-sm">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 text-black mr-3 mt-0.5 flex-shrink-0"
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
                <h3 className="text-base sm:text-lg font-bold text-black mb-2">Important Notice</h3>
                <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
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
                Prepare the following official documents in PNG/JPEG/JPG(Image) format (maximum 2MB each):
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
            <h3 className="text-base sm:text-lg font-bold text-black mb-3">Declaration</h3>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-5 leading-relaxed">
              By proceeding with registration, you acknowledge that all information provided is true and accurate. 
              You understand that providing false information may result in immediate disqualification and legal action.
            </p>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-5 w-5 mt-0.5 cursor-pointer text-black focus:ring-2 focus:ring-gray-500 border-2 border-gray-400 rounded transition-all duration-200"
              />
              <label htmlFor="agree" className="text-sm sm:text-base font-medium text-gray-800 cursor-pointer leading-relaxed">
                I have read and understood all instructions and agree to proceed with registration
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={nextStep}
          disabled={!agree}
          className={`px-8 sm:px-12 cursor-pointer py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 focus:outline-none focus:ring-4 ${
            agree
              ? "bg-black hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 focus:ring-gray-400"
              : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-md"
          }`}
        >
          {agree ? (
            <span className="flex items-center justify-center space-x-2">
              <span>Proceed to Registration</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          ) : (
            "Please Accept Declaration"
          )}
        </button>
      </div>
    </div>
  );
};

export default Instructions;
