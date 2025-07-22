import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReviewSubmit({ formData, registrationSuccess }) {
  // Format date with proper styling
  const formatDate = (dateString) => {
    if (!dateString) return <span className="text-gray-400 italic">Not provided</span>;
    const date = new Date(dateString);
    return (
      <span className="font-medium text-blue-700">
        {date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </span>
    );
  };

  // Enhanced file display with icons
  const renderFileInfo = (file) => {
    if (!file) return (
      <span className="inline-flex items-center text-red-500 bg-red-50 px-3 py-1 rounded-full text-sm">
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Missing
      </span>
    );
    
    return (
      <span className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {file.name}
      </span>
    );
  };

  // Achievement cards with hover effects
  const renderAchievements = (achievements, title) => {
    if (!achievements || achievements.length === 0 || !achievements[0].event) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No {title} provided</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((ach, index) => (
          <div 
            key={index} 
            className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <h4 className="font-medium text-blue-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {ach.event}
            </h4>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(ach.date)}
            </div>
            {ach.outcome && (
              <p className="mt-2 text-sm bg-blue-50/50 p-2 rounded-md">
                {ach.outcome}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Section header component
  const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center mb-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3 shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        {title}
      </h3>
    </div>
  );

  // Info row component
  const InfoRow = ({ label, value, cols = 1 }) => (
    <div className={`space-y-1 ${cols > 1 ? `md:col-span-${cols}` : ''}`}>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="text-gray-800 font-medium">{value}</div>
    </div>
  );

  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (registrationSuccess) {
      setShowConfirmation(true);
      const timer = setTimeout(() => {
        // Store a flag in localStorage to show popup on homepage
        if (formData?.personal?.email) {
          localStorage.setItem('showLoginPopup', JSON.stringify({ show: true, email: formData.personal.email }));
        } else {
          localStorage.setItem('showLoginPopup', JSON.stringify({ show: true }));
        }
        navigate("/");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate, formData]);

  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <svg className="w-20 h-20 text-white mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#22c55e" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" stroke="#fff" />
          </svg>
          <h2 className="text-3xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-lg text-white/90 mb-4 text-center">Thank you for registering. You will be redirected to the homepage shortly.</p>
          <div className="w-full bg-white/30 rounded-full h-2.5 mt-2">
            <div className="bg-white h-2.5 rounded-full transition-all duration-700 animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-10 bg-gradient-to-br from-white via-blue-50 to-red-50 rounded-3xl shadow-2xl border-2 border-blue-200/40 animate-fade-in">
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-4 mb-2">
          <span className="inline-block w-2 h-10 bg-blue-500 rounded-full"></span>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-red-500 to-blue-700 drop-shadow-lg">
            Application Review
          </h1>
          <span className="inline-block w-2 h-10 bg-red-500 rounded-full"></span>
        </div>
        <p className="text-lg text-blue-700/90 max-w-2xl mx-auto font-medium tracking-wide">
          Please verify all information before submission. Contact support if any corrections are needed.
        </p>
      </div>

      <div className="space-y-12">
        {/* Personal Information */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-blue-200/40">
            <SectionHeader 
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>}
              title="Personal Information"
            />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <InfoRow 
                label="Full Name" 
                value={`${formData.personal.firstName} ${formData.personal.middleName || ''} ${formData.personal.lastName}`.trim()} 
              />
              <InfoRow label="ABC ID" value={formData.personal.abcId || formatDate(null)} />
              <InfoRow label="Course" value={formData.personal.course || formatDate(null)} />
              <InfoRow label="Date of Birth" value={formatDate(formData.personal.dob)} />
              <InfoRow label="Gender" value={formData.personal.gender || formatDate(null)} />
              <InfoRow label="Category" value={formData.personal.category || formatDate(null)} />
              <InfoRow label="Email" value={formData.personal.email} />
              <InfoRow label="Mobile" value={formData.personal.mobile || formatDate(null)} />
              <InfoRow label="Anti-Ragging Ref" value={formData.personal.antiRaggingRef || formatDate(null)} />
              <InfoRow label="Current Address" value={formData.personal.currentAddress || formatDate(null)} cols={3} />
              <InfoRow label="Permanent Address" value={formData.personal.permanentAddress || formatDate(null)} cols={3} />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-blue-200/40">
            <SectionHeader 
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>}
              title="Academic Information"
            />
          </div>
          <div className="p-6 space-y-8">
            {/* Class X */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Class X Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoRow label="Institute" value={formData.academic.classX.institute || formatDate(null)} />
                <InfoRow label="Board" value={formData.academic.classX.board || formatDate(null)} />
                <InfoRow label="Year" value={formData.academic.classX.year || formatDate(null)} />
                <InfoRow label="Aggregate %" value={formData.academic.classX.aggregate || formatDate(null)} />
                <InfoRow label="PCM %" value={formData.academic.classX.pcm || formatDate(null)} />
              </div>
            </div>

            {/* Class XII */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Class XII Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoRow label="Institute" value={formData.academic.classXII.institute || formatDate(null)} />
                <InfoRow label="Board" value={formData.academic.classXII.board || formatDate(null)} />
                <InfoRow label="Year" value={formData.academic.classXII.year || formatDate(null)} />
                <InfoRow label="Aggregate %" value={formData.academic.classXII.aggregate || formatDate(null)} />
                <InfoRow label="PCM %" value={formData.academic.classXII.pcm || formatDate(null)} />
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h4 className="text-lg font-semibold text-blue-700 mb-4">Academic Achievements</h4>
              {renderAchievements(formData.academic.academicAchievements, "academic achievements")}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-blue-700 mb-4">Co-Curricular Achievements</h4>
              {renderAchievements(formData.academic.coCurricularAchievements, "co-curricular achievements")}
            </div>
          </div>
        </div>

        {/* Parents Information */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-blue-200/40">
            <SectionHeader 
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>}
              title="Parents Information"
            />
          </div>
          <div className="p-6 space-y-8">
            {/* Father */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Father's Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoRow label="Name" value={formData.parents.father.name || formatDate(null)} />
                <InfoRow label="Occupation" value={formData.parents.father.occupation || formatDate(null)} />
                <InfoRow label="Qualification" value={formData.parents.father.qualification || formatDate(null)} />
                <InfoRow label="Mobile" value={formData.parents.father.mobile || formatDate(null)} />
                <InfoRow label="Email" value={formData.parents.father.email || formatDate(null)} />
                <InfoRow label="Office Address" value={formData.parents.father.officeAddress || formatDate(null)} cols={3} />
              </div>
            </div>

            {/* Mother */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mother's Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoRow label="Name" value={formData.parents.mother.name || formatDate(null)} />
                <InfoRow label="Occupation" value={formData.parents.mother.occupation || formatDate(null)} />
                <InfoRow label="Qualification" value={formData.parents.mother.qualification || formatDate(null)} />
                <InfoRow label="Mobile" value={formData.parents.mother.mobile || formatDate(null)} />
                <InfoRow label="Email" value={formData.parents.mother.email || formatDate(null)} />
                <InfoRow label="Office Address" value={formData.parents.mother.officeAddress || formatDate(null)} cols={3} />
              </div>
            </div>

            {/* Family Income */}
            <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-3">Family Income</h4>
              <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-blue-200">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-blue-700">
                  {formData.parents.familyIncome === '<5' && 'Less than 5 lacs'}
                  {formData.parents.familyIncome === '5-7' && '5 lacs to 7 lacs'}
                  {formData.parents.familyIncome === '7-10' && '7 lacs to 10 lacs'}
                  {formData.parents.familyIncome === '>10' && 'More than 10 lacs'}
                  {!formData.parents.familyIncome && 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-blue-200/40">
            <SectionHeader 
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>}
              title="Uploaded Documents"
            />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="Photograph" value={renderFileInfo(formData.documents.photo)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="IPU Registration Slip" value={renderFileInfo(formData.documents.ipuRegistration)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="Allotment Letter" value={renderFileInfo(formData.documents.allotmentLetter)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="10th Marksheet" value={renderFileInfo(formData.documents.marksheet10)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="10th Passing Certificate" value={renderFileInfo(formData.documents.passing10)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="12th Marksheet" value={renderFileInfo(formData.documents.marksheet12)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="12th Passing Certificate" value={renderFileInfo(formData.documents.passing12)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="Aadhar Card" value={renderFileInfo(formData.documents.aadhar)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="Character Certificate" value={renderFileInfo(formData.documents.characterCertificate)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="Medical Certificate" value={renderFileInfo(formData.documents.medicalCertificate)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="Migration Certificate" value={renderFileInfo(formData.documents.migrationCertificate)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="Category Certificate" value={renderFileInfo(formData.documents.categoryCertificate)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="Academic Fee Receipt" value={renderFileInfo(formData.documents.academicFeeReceipt)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="College Fee Receipt" value={renderFileInfo(formData.documents.collegeFeeReceipt)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow label="Parent's Signature" value={renderFileInfo(formData.documents.parentSignature)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}