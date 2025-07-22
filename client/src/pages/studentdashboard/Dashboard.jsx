import React, { useEffect, useState } from "react";
import axios from "axios";
import { Tab } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const StudentDetailsDashboard = ({ student }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [sectionEdits, setSectionEdits] = useState({});
  const [saveStatus, setSaveStatus] = useState({});
  const [declinedFields, setDeclinedFields] = useState([]);
  const [updatedFields, setUpdatedFields] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!student?.id) {
      setLoading(false);
      setError("No student ID provided");
      return;
    }

    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/student/students/${student.id}/details`,
          { withCredentials: true }
        );

        if (response.data.success && response.data.data) {
          setDetails(response.data.data);
          setFormData(response.data.data);
          
          // Parse declined fields if they exist
          if (response.data.data.declinedFields) {
            // Check if declinedFields is already an array or needs parsing
            const fields = Array.isArray(response.data.data.declinedFields) 
              ? response.data.data.declinedFields
              : JSON.parse(response.data.data.declinedFields || '[]');
            setDeclinedFields(fields);

            // console.log("Declined fields:", fields);
          }
        } else {
          setDetails(response.data);
          setFormData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch student details:", err);
        
        if (err.response?.status === 404) {
          setError("Student not found");
        } else if (err.response?.status === 400) {
          setError("Invalid student ID");
        } else if (err.response?.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("Failed to load student details");
        }
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [student?.id]);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/student/logout`, {}, { withCredentials: true });
    } catch {}
    setShowLogoutModal(false);
    navigate('/');
  };

  const handleBackClick = () => {
    setShowLogoutModal(true);
  };

  const handleEditToggle = () => {
    if (!editMode) {
      // Reset when entering edit mode
      setUpdatedFields([]);
      setSectionEdits({});
      setSaveStatus({});
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (section, field, value) => {
    const fieldPath = `${section}.${field}`;

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Track updated fields
    if (declinedFields.includes(fieldPath)) {
      if (!updatedFields.includes(fieldPath)) {
        setUpdatedFields(prev => [...prev, fieldPath]);
      }
    }

    setSectionEdits(prev => ({
      ...prev,
      [section]: true
    }));
  };

  const isFieldDeclined = (section, field) => {
    return declinedFields.includes(`${section}.${field}`);
  };

  const isFieldEditable = (section, field) => {
    return editMode && isFieldDeclined(section, field);
  };

  const allDeclinedFieldsUpdated = () => {
    return declinedFields.length > 0 && 
           declinedFields.every(field => updatedFields.includes(field));
  };

  const handleUpdateDeclinedFields = async () => {
    try {
      setSaveStatus(prev => ({ ...prev, final: { loading: true, error: null } }));
      
      // Prepare data for only declined fields
      const updateData = {};
      declinedFields.forEach(fieldPath => {
        const [section, field] = fieldPath.split('.');
        if (!updateData[section]) updateData[section] = {};
        updateData[section][field] = formData[section]?.[field];
      });

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/student/students/${student.id}/update-declined`,
        { data: updateData },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update local state to reflect changes
        setDetails(prev => ({
          ...prev,
          ...formData,
          status: 'pending',
          declinedFields: response.data.declinedFields || []
        }));
        setDeclinedFields(response.data.declinedFields || []);
        setEditMode(false);
        setShowSuccessModal(true);
        setSaveStatus(prev => ({ ...prev, final: { loading: false, success: true } }));
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Failed to update declined fields:", err);
      setSaveStatus(prev => ({
        ...prev,
        final: {
          loading: false,
          error: err.response?.data?.message || "Failed to update profile"
        }
      }));
    }
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mt-2">
            Profile Submitted for Review
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Your profile has been successfully submitted for review. You'll be
              notified once the changes are approved.
            </p>
          </div>
          <div className="items-center justify-center mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LogoutModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mt-2">
            Confirm Logout
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Are you sure you want to log out? You'll need to log in again to
              access your dashboard.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-base font-medium rounded-md shadow-sm hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DetailCard = ({ title, children, section }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>
        {editMode && sectionEdits[section] && (
          <button
            onClick={() => handleSaveSection(section)}
            disabled={saveStatus[section]?.loading}
            className={`px-3 py-1 text-sm rounded-md ${
              saveStatus[section]?.loading
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } transition-colors`}
          >
            {saveStatus[section]?.loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : saveStatus[section]?.success ? (
              <span className="text-green-500">✓ Saved</span>
            ) : (
              "Save Changes"
            )}
          </button>
        )}
      </div>
      {saveStatus[section]?.error && (
        <div className="mb-4 text-sm text-red-500">
          {saveStatus[section].error}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );

  const DetailItem = ({ label, value, field, section, subSection, editable = true }) => {
    const fieldPath = subSection ? `${section}.${subSection}.${field}` : `${section}.${field}`;
    const isDeclined = isFieldDeclined(section, field);
    const isEditable = isFieldEditable(section, field);

    return (
      <div className="flex justify-between items-start">
        <span className={`${isDeclined ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'} font-medium`}>
          {label}:
          {isDeclined && !editMode && (
            <span className="ml-2 text-xs text-red-500 dark:text-red-400">(Requires update)</span>
          )}
        </span>
        {isEditable ? (
          <input
            type="text"
            value={formData[section]?.[field] || ''}
            onChange={(e) => handleInputChange(section, field, e.target.value)}
            className={`font-medium ${isDeclined ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'} bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 w-48 text-right border ${isDeclined ? 'border-red-300' : 'border-gray-300'}`}
          />
        ) : (
          <span className={`font-medium ${isDeclined ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'} text-right max-w-xs break-words`}>
            {value || <span className="text-gray-400 italic">N/A</span>}
          </span>
        )}
      </div>
    );
  };

  const DocumentCard = ({ title, url }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <h4 className="font-medium text-gray-800 dark:text-white mb-3">
        {title}
      </h4>
      {url ? (
        <>
          <div className="flex-1 flex items-center justify-center mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden min-h-[160px]">
            <img
              src={url}
              alt={title}
              className="max-h-40 max-w-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/150x150?text=Document+Error";
              }}
            />
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
          >
            View Full Document
          </a>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg
            className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-400 dark:text-gray-500 text-sm italic">
            Not uploaded
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading student details...
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Please wait while we fetch your information
          </p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error loading student details</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <div className="space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
            >
              <svg
                className="w-4 h-4 inline mr-1 -mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-sm"
            >
              <svg
                className="w-4 h-4 inline mr-1 -mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-700 dark:to-gray-800">
      {showLogoutModal && <LogoutModal />}
      {showSuccessModal && <SuccessModal />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Student Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Welcome back,{" "}
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {details.personal?.firstName}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {details.personal?.status === "declined" && (
              <button
                onClick={handleEditToggle}
                className={`px-4 py-2 rounded-lg transition-all shadow-sm ${
                  editMode
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                }`}
              >
                {editMode ? "Cancel Editing" : "Update Profile"}
              </button>
            )}
            <button
              onClick={handleBackClick}
              className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all flex items-center gap-2 shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </button>
          </div>
        </div>

        {/* Student Profile Summary */}
        <div
          className={`rounded-xl shadow-lg overflow-hidden mb-8 ${
            details.personal?.status === "declined"
              ? "bg-gradient-to-r from-red-600 to-red-700"
              : "bg-gradient-to-r from-blue-600 to-blue-700"
          }`}
        >
          <div className="p-6 flex flex-col md:flex-row items-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/80 shadow-lg mb-4 md:mb-0 md:mr-6">
              <img
                src={
                  details.documents?.photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    (details.personal?.firstName || "") +
                      " " +
                      (details.personal?.lastName || "")
                  )}&background=random&size=112`
                }
                alt="Student"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    (details.personal?.firstName || "Student") +
                      " " +
                      (details.personal?.lastName || "")
                  )}&background=random&size=112`;
                }}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">
                {details.personal?.firstName}{" "}
                {details.personal?.middleName
                  ? details.personal.middleName + " "
                  : ""}
                {details.personal?.lastName}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {details.personal?.course}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {details.personal?.category}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    details.personal?.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : details.personal?.status === "declined"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {details.personal?.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-3 text-sm text-white/90">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {details.personal?.email}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {details.personal?.mobile}
                </span>
              </div>
              {details.personal?.status === "declined" && (
                <div className="mt-4 bg-white/20 text-white text-sm p-3 rounded-lg">
                  <p>
                    Your profile has been declined. Please update the required
                    information (marked in red) and resubmit for review.
                  </p>
                  {declinedFields.length > 0 && (
                    <p className="mt-1">
                      Fields requiring update: {declinedFields.length}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Documents Uploaded
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {
                    Object.values(details.documents || {}).filter((doc) => doc)
                      .length
                  }
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {" "}
                    / {Object.keys(details.documents || {}).length}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Academic Status
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {details.academic?.classXII?.aggregate || "N/A"}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Family Income
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {details.parent?.familyIncome
                    ? `₹${Number(details.parent.familyIncome).toLocaleString(
                        "en-IN"
                      )}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 dark:bg-gray-700 p-1 mb-6">
            {["Personal", "Parent", "Academic", "Documents"].map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  `w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all duration-200
                  ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                  ${
                    selected
                      ? "bg-white dark:bg-gray-800 shadow text-blue-700 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300"
                  }`
                }
              >
                {category}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-2">
            {/* Personal Information Tab */}
            <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailCard title="Basic Information" section="personal">
                  <DetailItem
                    label="First Name"
                    value={`${details.personal?.firstName || ""}`.trim()}
                    field="firstName"
                    section="personal"
                  />
                  <DetailItem
                    label="Middle Name"
                    value={`${details.personal?.middleName || ""}`.trim()}
                    field="middleName"
                    section="personal"
                  />
                  <DetailItem
                    label="Last Name"
                    value={`${details.personal?.lastName || ""}`.trim()}
                    field="lastName"
                    section="personal"
                  />
                  <DetailItem
                    label="Date of Birth"
                    value={details.personal?.dob}
                    field="dob"
                    section="personal"
                  />
                  <DetailItem
                    label="Place of Birth"
                    value={details.personal?.placeOfBirth}
                    field="placeOfBirth"
                    section="personal"
                  />
                  <DetailItem
                    label="Gender"
                    value={details.personal?.gender}
                    field="gender"
                    section="personal"
                  />
                  <DetailItem
                    label="Category"
                    value={`${details.personal?.category || ""}${
                      details.personal?.subCategory
                        ? ` (${details.personal.subCategory})`
                        : ""
                    }`}
                    field="category"
                    section="personal"
                  />
                  <DetailItem
                    label="Region"
                    value={details.personal?.region}
                    field="region"
                    section="personal"
                  />
                </DetailCard>

                <DetailCard title="Contact Information" section="personal">
                  <DetailItem
                    label="Email"
                    value={details.personal?.email}
                    field="email"
                    section="personal"
                  />
                  <DetailItem
                    label="Mobile"
                    value={details.personal?.mobile}
                    field="mobile"
                    section="personal"
                  />
                  <DetailItem
                    label="Current Address"
                    value={details.personal?.currentAddress}
                    field="currentAddress"
                    section="personal"
                  />
                  <DetailItem
                    label="Permanent Address"
                    value={details.personal?.permanentAddress}
                    field="permanentAddress"
                    section="personal"
                  />
                </DetailCard>

                <DetailCard title="Academic Information" section="personal">
                  <DetailItem
                    label="Course"
                    value={details.personal?.course}
                    field="course"
                    section="personal"
                  />
                  <DetailItem
                    label="Exam Roll No"
                    value={details.personal?.examRoll}
                    field="examRoll"
                    section="personal"
                  />
                  <DetailItem
                    label="Exam Rank"
                    value={details.personal?.examRank}
                    field="examRank"
                    section="personal"
                  />
                  <DetailItem
                    label="ABC ID"
                    value={details.personal?.abcId}
                    field="abcId"
                    section="personal"
                  />
                  <DetailItem
                    label="Fee Reimbursement"
                    value={details.personal?.feeReimbursement}
                    field="feeReimbursement"
                    section="personal"
                  />
                  <DetailItem
                    label="Anti-Ragging Ref"
                    value={details.personal?.antiRaggingRef}
                    field="antiRaggingRef"
                    section="personal"
                  />
                </DetailCard>
              </div>
            </Tab.Panel>

            {/* Parent Information Tab */}
            <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailCard title="Father's Details" section="parent">
                  <DetailItem
                    label="Name"
                    value={details.parent?.father?.name}
                    field="name"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Qualification"
                    value={details.parent?.father?.qualification}
                    field="qualification"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Occupation"
                    value={details.parent?.father?.occupation}
                    field="occupation"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Email"
                    value={details.parent?.father?.email}
                    field="email"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Mobile"
                    value={details.parent?.father?.mobile}
                    field="mobile"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Telephone (STD)"
                    value={details.parent?.father?.telephoneSTD}
                    field="telephoneSTD"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Telephone"
                    value={details.parent?.father?.telephone}
                    field="telephone"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Office Address"
                    value={details.parent?.father?.officeAddress}
                    field="officeAddress"
                    section="parent"
                    subSection="father"
                  />
                </DetailCard>

                <DetailCard title="Mother's Details" section="parent">
                  <DetailItem
                    label="Name"
                    value={details.parent?.mother?.name}
                    field="name"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Qualification"
                    value={details.parent?.mother?.qualification}
                    field="qualification"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Occupation"
                    value={details.parent?.mother?.occupation}
                    field="occupation"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Email"
                    value={details.parent?.mother?.email}
                    field="email"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Mobile"
                    value={details.parent?.mother?.mobile}
                    field="mobile"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Telephone (STD)"
                    value={details.parent?.mother?.telephoneSTD}
                    field="telephoneSTD"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Telephone"
                    value={details.parent?.mother?.telephone}
                    field="telephone"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Office Address"
                    value={details.parent?.mother?.officeAddress}
                    field="officeAddress"
                    section="parent"
                    subSection="mother"
                  />
                </DetailCard>

                <DetailCard title="Family Information" section="parent">
                  <DetailItem
                    label="Annual Income"
                    value={
                      details.parent?.familyIncome
                        ? `₹${Number(
                            details.parent.familyIncome
                          ).toLocaleString("en-IN")}`
                        : "N/A"
                    }
                    field="familyIncome"
                    section="parent"
                  />
                  {details.parent?.siblings?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Siblings
                      </h4>
                      <div className="space-y-2">
                        {details.parent.siblings.map((sibling, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                          >
                            <strong>{sibling.name}</strong> ({sibling.relation})
                            <br />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {sibling.institution || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </DetailCard>
              </div>
            </Tab.Panel>

            {/* Academic Information Tab */}
            <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailCard title="Class X Details" section="academic">
                  <DetailItem
                    label="Institute"
                    value={details.academic?.classX?.institute}
                    field="institute"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="Board"
                    value={details.academic?.classX?.board}
                    field="board"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="Year"
                    value={details.academic?.classX?.year}
                    field="year"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="Aggregate %"
                    value={details.academic?.classX?.aggregate}
                    field="aggregate"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="PCM %"
                    value={details.academic?.classX?.pcm}
                    field="pcm"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="Diploma/Polytechnic"
                    value={details.academic?.classX?.isDiplomaOrPolytechnic}
                    field="isDiplomaOrPolytechnic"
                    section="academic"
                    subSection="classX"
                  />
                </DetailCard>

                <DetailCard title="Class XII Details" section="academic">
                  <DetailItem
                    label="Institute"
                    value={details.academic?.classXII?.institute}
                    field="institute"
                    section="academic"
                    subSection="classXII"
                  />
                  <DetailItem
                    label="Board"
                    value={details.academic?.classXII?.board}
                    field="board"
                    section="academic"
                    subSection="classXII"
                  />
                  <DetailItem
                    label="Year"
                    value={details.academic?.classXII?.year}
                    field="year"
                    section="academic"
                    subSection="classXII"
                  />
                  <DetailItem
                    label="Aggregate %"
                    value={details.academic?.classXII?.aggregate}
                    field="aggregate"
                    section="academic"
                    subSection="classXII"
                  />
                  <DetailItem
                    label="PCM %"
                    value={details.academic?.classXII?.pcm}
                    field="pcm"
                    section="academic"
                    subSection="classXII"
                  />
                </DetailCard>

                {details.academic?.otherQualification?.institute && (
                  <DetailCard title="Other Qualification" section="academic">
                    <DetailItem
                      label="Institute"
                      value={details.academic.otherQualification.institute}
                      field="institute"
                      section="academic"
                      subSection="otherQualification"
                    />
                    <DetailItem
                      label="Board"
                      value={details.academic.otherQualification.board}
                      field="board"
                      section="academic"
                      subSection="otherQualification"
                    />
                    <DetailItem
                      label="Year"
                      value={details.academic.otherQualification.year}
                      field="year"
                      section="academic"
                      subSection="otherQualification"
                    />
                    <DetailItem
                      label="Aggregate %"
                      value={details.academic.otherQualification.aggregate}
                      field="aggregate"
                      section="academic"
                      subSection="otherQualification"
                    />
                    <DetailItem
                      label="PCM %"
                      value={details.academic.otherQualification.pcm}
                      field="pcm"
                      section="academic"
                      subSection="otherQualification"
                    />
                  </DetailCard>
                )}

                {details.academic?.academicAchievements?.length > 0 && (
                  <DetailCard title="Academic Achievements" section="academic">
                    <div className="space-y-2">
                      {details.academic.academicAchievements.map(
                        (achievement, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                          >
                            <strong>{achievement.event}</strong> (
                            {achievement.date})<br />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {achievement.outcome}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </DetailCard>
                )}

                {details.academic?.coCurricularAchievements?.length > 0 && (
                  <DetailCard
                    title="Co-Curricular Achievements"
                    section="academic"
                  >
                    <div className="space-y-2">
                      {details.academic.coCurricularAchievements.map(
                        (achievement, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                          >
                            <strong>{achievement.event}</strong> (
                            {achievement.date})<br />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {achievement.outcome}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </DetailCard>
                )}
              </div>
            </Tab.Panel>

            {/* Documents Tab */}
            <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <DocumentCard
                  title="Student Photo"
                  url={details.documents?.photo}
                />
                <DocumentCard
                  title="IPU Registration"
                  url={details.documents?.ipuRegistration}
                />
                <DocumentCard
                  title="Allotment Letter"
                  url={details.documents?.allotmentLetter}
                />
                <DocumentCard
                  title="Exam Admit Card"
                  url={details.documents?.examAdmitCard}
                />
                <DocumentCard
                  title="Exam Score Card"
                  url={details.documents?.examScoreCard}
                />
                <DocumentCard
                  title="10th Marksheet"
                  url={details.documents?.marksheet10}
                />
                <DocumentCard
                  title="10th Passing Certificate"
                  url={details.documents?.passing10}
                />
                <DocumentCard
                  title="12th Marksheet"
                  url={details.documents?.marksheet12}
                />
                <DocumentCard
                  title="12th Passing Certificate"
                  url={details.documents?.passing12}
                />
                <DocumentCard
                  title="Aadhar Card"
                  url={details.documents?.aadhar}
                />
                <DocumentCard
                  title="Character Certificate"
                  url={details.documents?.characterCertificate}
                />
                <DocumentCard
                  title="Medical Certificate"
                  url={details.documents?.medicalCertificate}
                />
                <DocumentCard
                  title="Migration Certificate"
                  url={details.documents?.migrationCertificate}
                />
                <DocumentCard
                  title="Category Certificate"
                  url={details.documents?.categoryCertificate}
                />
                <DocumentCard
                  title="Special Category Certificate"
                  url={details.documents?.specialCategoryCertificate}
                />
                <DocumentCard
                  title="Academic Fee Receipt"
                  url={details.documents?.academicFeeReceipt}
                />
                <DocumentCard
                  title="College Fee Receipt"
                  url={details.documents?.collegeFeeReceipt}
                />
                <DocumentCard
                  title="Parent Signature"
                  url={details.documents?.parentSignature}
                />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Final Update Button (only in edit mode for declined status) */}
        {editMode && details.personal?.status === "declined" && (
          <div className="mt-8 flex justify-end items-center">
            <div className="mr-4 text-sm text-gray-600 dark:text-gray-300">
              {updatedFields.length} of {declinedFields.length} required fields
              updated
            </div>
            <button
              onClick={handleUpdateDeclinedFields}
              disabled={
                !allDeclinedFieldsUpdated() || saveStatus.final?.loading
              }
              className={`px-6 py-3 text-white font-medium rounded-lg transition-all shadow-lg flex items-center gap-2 ${
                allDeclinedFieldsUpdated()
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {saveStatus.final?.loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Profile for Review"
              )}
            </button>
            {saveStatus.final?.error && (
              <div className="ml-4 text-red-500 text-sm">
                {saveStatus.final.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailsDashboard;
