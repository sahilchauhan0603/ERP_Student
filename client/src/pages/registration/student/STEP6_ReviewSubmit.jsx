import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatFamilyIncome } from "../../../utils/formatters";

export default function ReviewSubmit({
  formData,
  registrationSuccess,
  incompleteFields = [],
}) {
  // Format date with proper styling
  const formatDate = (dateString) => {
    if (!dateString)
      return <span className="text-gray-400 italic">Not provided</span>;
    const date = new Date(dateString);
    return (
      <span className="font-medium text-gray-700">
        {date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
    );
  };

  // Enhanced file display with icons and preview functionality
  const renderFileInfo = (file) => {
    if (!file)
      return (
        <span className="inline-flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Missing
        </span>
      );

    // Check if file is a PDF or image
    const isPDF = file.name && file.name.toLowerCase().includes('.pdf');
    const isImage = file.name && (file.name.toLowerCase().includes('.jpg') || file.name.toLowerCase().includes('.jpeg') || file.name.toLowerCase().includes('.png') || file.name.toLowerCase().includes('.gif') || file.name.toLowerCase().includes('.webp'));

    return (
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <span className="inline-flex items-center bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="truncate max-w-20 sm:max-w-32">{file.name}</span>
        </span>
        {file && (
          <button
            onClick={() => {
              if (isImage) {
                // For images, open in new tab
                window.open(URL.createObjectURL(file), '_blank');
              } else if (isPDF) {
                // For PDFs, download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.download = file.name;
                link.click();
              } else {
                // For other files, download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.download = file.name;
                link.click();
              }
            }}
            className="text-xs bg-gray-800 text-white cursor-pointer px-2 py-1 rounded hover:bg-gray-700 transition-colors whitespace-nowrap w-full sm:w-auto text-center"
          >
            {isImage ? 'View' : 'Download'}
          </button>
        )}
      </div>
    );
  };

  // Achievement cards with hover effects
  const renderAchievements = (achievements, title) => {
    if (!achievements || achievements.length === 0 || !achievements[0].event) {
      return (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 text-center">
          <p className="text-sm sm:text-base text-gray-500">No {title} provided</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {achievements.map((ach, index) => (
          <div
            key={index}
            className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <h4 className="text-sm sm:text-base font-medium text-gray-800 flex items-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {ach.event}
            </h4>
            <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-600">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(ach.date)}
            </div>
            {ach.outcome && (
              <p className="mt-2 text-xs sm:text-sm bg-gray-100 p-2 rounded-md text-gray-700">
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
    <div className="flex items-center mb-4 sm:mb-6">
      <div className="bg-gray-800 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
        {title}
      </h3>
    </div>
  );

  // Info row component
  const InfoRow = ({ label, value, cols = 1 }) => (
    <div className={`space-y-1 ${cols > 1 ? `md:col-span-${cols}` : ""} p-3 sm:p-4 border border-gray-100 rounded-lg bg-white hover:bg-gray-50 transition-colors`}>
      <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <div className="text-sm sm:text-base text-gray-800 font-medium">{value}</div>
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
          localStorage.setItem(
            "showLoginPopup",
            JSON.stringify({ show: true, email: formData.personal.email })
          );
        } else {
          localStorage.setItem(
            "showLoginPopup",
            JSON.stringify({ show: true })
          );
        }
        navigate("/");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate, formData]);

  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <svg
            className="w-20 h-20 text-white mb-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="#10b981"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4"
              stroke="#fff"
            />
          </svg>
          <h2 className="text-3xl font-bold text-white mb-2">
            Registration Successful!
          </h2>
          <p className="text-lg text-white/90 mb-4 text-center">
            Thank you for registering. You will be redirected to the homepage
            shortly.
          </p>
          <div className="w-full bg-white/30 rounded-full h-2.5 mt-2">
            <div
              className="bg-white h-2.5 rounded-full transition-all duration-700 animate-pulse"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl border border-gray-200 animate-fade-in relative">
      {/* Background pattern for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50 rounded-xl sm:rounded-2xl lg:rounded-3xl"></div>
      <div className="relative z-10">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="flex justify-center items-center mb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black">
              Application Review
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 max-w-2xl mx-auto font-medium tracking-wide px-2">
            Please verify all information before submission. Contact support if
            any corrections are needed.
          </p>
          {/* Horizontal separator line */}
          <div className="mt-6 sm:mt-8 border-t-2 border-gray-300 w-16 sm:w-20 lg:w-24 mx-auto"></div>
        </div>

      <div className="space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Personal Information */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200/40 bg-gray-50">
            <SectionHeader
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              title="Personal Information"
            />
          </div>
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <InfoRow
                label="Full Name"
                value={`${formData.personal.firstName} ${
                  formData.personal.middleName || ""
                } ${formData.personal.lastName}`.trim()}
              />
              <InfoRow
                label="ABC ID"
                value={formData.personal.abcId || formatDate(null)}
              />
              <InfoRow
                label="Course"
                value={formData.personal.course || formatDate(null)}
              />
              <InfoRow
                label="Date of Birth"
                value={formatDate(formData.personal.dob)}
              />
              <InfoRow
                label="Gender"
                value={formData.personal.gender || formatDate(null)}
              />
              <InfoRow
                label="Category"
                value={formData.personal.category || formatDate(null)}
              />
              <InfoRow label="Email" value={formData.personal.email} />
              <InfoRow
                label="Mobile"
                value={formData.personal.mobile || formatDate(null)}
              />
              <InfoRow
                label="Anti-Ragging Ref"
                value={formData.personal.antiRaggingRef || formatDate(null)}
              />
              <InfoRow
                label="Current Address"
                value={formData.personal.currentAddress || formatDate(null)}
                cols={3}
              />
              <InfoRow
                label="Permanent Address"
                value={formData.personal.permanentAddress || formatDate(null)}
                cols={3}
              />
            </div>
          </div>
        </div>

        {/* Section separator */}
        <div className="border-t-2 border-gray-300 my-6 sm:my-8"></div>

        {/* Academic Information */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200/40 bg-gray-50">
            <SectionHeader
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
              title="Academic Information"
            />
          </div>
          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Class X */}
            <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 relative">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Class X Details
              </h4>
              {/* Horizontal separator line */}
              <div className="border-b border-gray-300 mb-4 sm:mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <InfoRow
                  label="Institute"
                  value={formData.academic.classX.institute || formatDate(null)}
                />
                <InfoRow
                  label="Board"
                  value={formData.academic.classX.board || formatDate(null)}
                />
                <InfoRow
                  label="Year"
                  value={formData.academic.classX.year || formatDate(null)}
                />
                <InfoRow
                  label="Aggregate %"
                  value={formData.academic.classX.aggregate || formatDate(null)}
                />
                <InfoRow
                  label="PCM %"
                  value={formData.academic.classX.pcm || formatDate(null)}
                />
              </div>
            </div>

            {/* Class XII */}
            <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 relative">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Class XII Details
              </h4>
              {/* Horizontal separator line */}
              <div className="border-b border-gray-300 mb-4 sm:mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <InfoRow
                  label="Institute"
                  value={
                    formData.academic.classXII.institute || formatDate(null)
                  }
                />
                <InfoRow
                  label="Board"
                  value={formData.academic.classXII.board || formatDate(null)}
                />
                <InfoRow
                  label="Year"
                  value={formData.academic.classXII.year || formatDate(null)}
                />
                <InfoRow
                  label="Aggregate %"
                  value={
                    formData.academic.classXII.aggregate || formatDate(null)
                  }
                />
                <InfoRow
                  label="PCM %"
                  value={formData.academic.classXII.pcm || formatDate(null)}
                />
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Academic Achievements
              </h4>
              {renderAchievements(
                formData.academic.academicAchievements,
                "academic achievements"
              )}
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Co-Curricular Achievements
              </h4>
              {renderAchievements(
                formData.academic.coCurricularAchievements,
                "co-curricular achievements"
              )}
            </div>
          </div>
        </div>

        {/* Section separator */}
        <div className="border-t-2 border-gray-300 my-6 sm:my-8"></div>

        {/* Parents Information */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200/40 bg-gray-50">
            <SectionHeader
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              title="Parents Information"
            />
          </div>
          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Father */}
            <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 relative">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Father's Details
              </h4>
              {/* Horizontal separator line */}
              <div className="border-b border-gray-300 mb-4 sm:mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <InfoRow
                  label="Name"
                  value={formData.parents.father.name || formatDate(null)}
                />
                <InfoRow
                  label="Occupation"
                  value={formData.parents.father.occupation || formatDate(null)}
                />
                <InfoRow
                  label="Qualification"
                  value={
                    formData.parents.father.qualification || formatDate(null)
                  }
                />
                <InfoRow
                  label="Mobile"
                  value={formData.parents.father.mobile || formatDate(null)}
                />
                <InfoRow
                  label="Email"
                  value={formData.parents.father.email || formatDate(null)}
                />
                <InfoRow
                  label="Office Address"
                  value={
                    formData.parents.father.officeAddress || formatDate(null)
                  }
                  cols={3}
                />
              </div>
            </div>

            {/* Mother */}
            <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 relative">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Mother's Details
              </h4>
              {/* Horizontal separator line */}
              <div className="border-b border-gray-300 mb-4 sm:mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <InfoRow
                  label="Name"
                  value={formData.parents.mother.name || formatDate(null)}
                />
                <InfoRow
                  label="Occupation"
                  value={formData.parents.mother.occupation || formatDate(null)}
                />
                <InfoRow
                  label="Qualification"
                  value={
                    formData.parents.mother.qualification || formatDate(null)
                  }
                />
                <InfoRow
                  label="Mobile"
                  value={formData.parents.mother.mobile || formatDate(null)}
                />
                <InfoRow
                  label="Email"
                  value={formData.parents.mother.email || formatDate(null)}
                />
                <InfoRow
                  label="Office Address"
                  value={
                    formData.parents.mother.officeAddress || formatDate(null)
                  }
                  cols={3}
                />
              </div>
            </div>

            {/* Family Income */}
            <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                Family Income
              </h4>
              <div className="inline-flex items-center bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm sm:text-base font-medium text-gray-700">
                  {formatFamilyIncome(formData.parents.familyIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section separator */}
        <div className="border-t-2 border-gray-300 my-6 sm:my-8"></div>

        {/* Documents */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200/40 bg-gray-50">
            <SectionHeader
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
              title="Uploaded Documents"
            />
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="Photograph"
                  value={renderFileInfo(formData.documents.photo)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="IPU Registration Slip"
                  value={renderFileInfo(formData.documents.ipuRegistration)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="Allotment Letter"
                  value={renderFileInfo(formData.documents.allotmentLetter)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="10th Marksheet"
                  value={renderFileInfo(formData.documents.marksheet10)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="10th Passing Certificate"
                  value={renderFileInfo(formData.documents.passing10)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="12th Marksheet"
                  value={renderFileInfo(formData.documents.marksheet12)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="12th Passing Certificate"
                  value={renderFileInfo(formData.documents.passing12)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="Aadhar Card"
                  value={renderFileInfo(formData.documents.aadhar)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="Character Certificate"
                  value={renderFileInfo(
                    formData.documents.characterCertificate
                  )}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="Medical Certificate"
                  value={renderFileInfo(formData.documents.medicalCertificate)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="Migration Certificate"
                  value={renderFileInfo(
                    formData.documents.migrationCertificate
                  )}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="Category Certificate"
                  value={renderFileInfo(formData.documents.categoryCertificate)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="Academic Fee Receipt"
                  value={renderFileInfo(formData.documents.academicFeeReceipt)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="College Fee Receipt"
                  value={renderFileInfo(formData.documents.collegeFeeReceipt)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <InfoRow
                  label="Parent's Signature"
                  value={renderFileInfo(formData.documents.parentSignature)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
