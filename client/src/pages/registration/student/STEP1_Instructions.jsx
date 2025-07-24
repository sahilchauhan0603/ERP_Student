import React, { useState } from 'react';

const Instructions = ({ nextStep }) => {
  const [agree, setAgree] = useState(false);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-200 animate-fade-in">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4 mb-2">
          <span className="inline-block w-2 h-10 bg-gray-800 rounded-full"></span>
          <h2 className="text-3xl font-extrabold text-black">
            Registration Instructions
          </h2>
          <span className="inline-block w-2 h-10 bg-gray-800 rounded-full"></span>
        </div>
        <p className="text-lg text-gray-700 font-medium tracking-wide">
          Please read carefully before proceeding
        </p>
      </div>

      <div className="bg-gray-50 p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-200 mb-10 transition-all duration-300 hover:shadow-xl">
        <div className="prose max-w-none">
          <p className="text-lg font-medium text-gray-700 mb-6">
            <span className="inline-block bg-gray-100 text-gray-700 rounded-full p-2 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <strong>Important:</strong> Please read all instructions carefully before proceeding.
          </p>
          
          <ol className="space-y-6 list-decimal pl-5 marker:text-gray-500 marker:font-bold">
            <li className="pl-2">
              Visit the{' '}
              <a
                href="https://antiragging.in/affidavit_affiliated_form.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
              >
                Anti-Ragging Website
              </a>{' '}
              and fill the form to get your reference number. You will need this number later in the registration form.
            </li>
            
            <li className="pl-2">
              Prepare these documents in PDF/JPEG format (max 2MB each):
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Photograph',
                  'IPU Registration Slip',
                  'Allotment Letter',
                  'Exam Admit Card',
                  'Exam Score Card',
                  'Xth Marksheet',
                  'Xth Passing Certificate',
                  'XIIth Marksheet',
                  'XIIth Passing Certificate',
                  'Aadhar Card',
                  'Character Certificate',
                  'Medical Certificate',
                  'Migration Certificate',
                  'Category Certificate (if applicable)',
                  'Special Category Certificate (if applicable)',
                  'Academic Fee Receipt',
                  'College Fee Receipt',
                  "Parent's Signature",
                ].map((doc, i) => (
                  <div key={i} className="flex items-start">
                    <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-1 mr-2 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <span className="text-blue-800/90">{doc}</span>
                  </div>
                ))}
              </div>
            </li>
            
            <li className="pl-2">
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <p className="font-medium text-blue-700/90 mb-2">File Naming Convention:</p>
                <code className="block bg-white px-3 py-2 rounded-md text-blue-800 border border-blue-200">
                  FileName.pdf
                </code>
              </div>
            </li>
            
            <li className="pl-2">
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <p className="font-medium text-amber-700/90">
                  <span className="inline-block bg-amber-100 text-amber-600 rounded-full p-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </span>
                  Important: Ensure all information matches your official documents. Any discrepancies may lead to cancellation of admission.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <div className="flex items-center bg-blue-50/50 p-4 rounded-lg border border-blue-100 0 mb-10">
        <input
          type="checkbox"
          id="agree-terms"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="h-6 w-6 rounded border-2 border-blue-400 text-blue-600 focus:ring-blue-500 focus:ring-offset-blue-50 transition-all shadow-sm"
        />
        <label htmlFor="agree-terms" className="ml-3 text-blue-800/90 font-semibold">
          I have read and understood all instructions
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => agree ? nextStep() : alert('Please accept the instructions to continue')}
          className={`px-7 py-3 rounded-2xl text-lg font-bold transition-all duration-300 flex items-center gap-2 ${
            agree
              ? 'bg-black text-white shadow-md hover:bg-gray-800'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Registration
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Instructions;