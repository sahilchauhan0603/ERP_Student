import React, { useEffect, useState } from "react";
import axios from "axios";
import { Tab } from "@headlessui/react";
import { formatFamilyIncome } from "../../utils/formatters";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

const StudentDetailsDashboard = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  // Removed showLogoutModal state since we now use SweetAlert
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [declinedFields, setDeclinedFields] = useState([]);
  const [updatedFields, setUpdatedFields] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState({
    final: { loading: false, error: null, success: false },
  });
  const [updatedDocuments, setUpdatedDocuments] = useState({});
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/student/students/me/details`,
          { withCredentials: true }
        );
        if (response.data.success && response.data.data) {
          setDetails(response.data.data);
          setFormData(response.data.data);
          if (response.data.data.declinedFields) {
            const fields = Array.isArray(response.data.data.declinedFields)
              ? response.data.data.declinedFields
              : JSON.parse(response.data.data.declinedFields || "[]");
            setDeclinedFields(fields);
          }
        } else {
          setDetails(response.data);
          setFormData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch student details:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          Swal.fire({
            icon: "error",
            title: "Unauthorized Access",
            text: "This page can only be accessed by authorized students.",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "/login";
          });
        } else if (err.response?.status === 404) {
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
  }, []);

  const handleLogout = async () => {
    try {
      await logout('student');
    } catch (err) {
      console.error("Logout failed:", err);
      // Optionally show error
    }
  };

  const handleBackClick = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    });
    if (result.isConfirmed) {
      handleLogout();
    }
  };

  const handleEditToggle = () => {
    if (!editMode) {
      // Reset when entering edit mode
      setUpdatedFields([]);
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (section, field, value) => {
    const fieldPath = `${section}.${field}`;

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Track updated fields
    if (declinedFields.includes(fieldPath)) {
      if (!updatedFields.includes(fieldPath)) {
        setUpdatedFields((prev) => [...prev, fieldPath]);
      }
    }
  };

  // Helper to check if a field is declined (handles nested fields)
  const isFieldDeclined = (section, field, subSection) => {
    if (subSection) {
      return declinedFields.includes(`${section}.${subSection}.${field}`);
    }
    return declinedFields.includes(`${section}.${field}`);
  };

  const isFieldEditable = (section, field, subSection) => {
    return editMode && isFieldDeclined(section, field, subSection);
  };

  const allDeclinedFieldsUpdated = () => {
    return (
      declinedFields.length > 0 &&
      declinedFields.every((field) => updatedFields.includes(field))
    );
  };

  const handleUpdateDeclinedFields = async () => {
    try {
      setSaveStatus((prev) => ({
        ...prev,
        final: { loading: true, error: null },
      }));
      const updateData = {};
      declinedFields.forEach((fieldPath) => {
        const [section, field] = fieldPath.split(".");
        if (!updateData[section]) updateData[section] = {};
        updateData[section][field] = formData[section]?.[field];
      });
      // Prepare FormData if there are updated documents
      let dataToSend = { data: updateData };
      if (Object.keys(updatedDocuments).length > 0) {
        const formDataObj = new FormData();
        formDataObj.append("data", JSON.stringify(updateData));
        Object.entries(updatedDocuments).forEach(([field, file]) => {
          formDataObj.append(field, file);
        });
        dataToSend = formDataObj;
      }
      const config = {
        withCredentials: true,
        headers:
          Object.keys(updatedDocuments).length > 0
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      };
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/student/students/me/update-declined`,
        dataToSend,
        config
      );
      if (response.data.success) {
        setDetails((prev) => ({
          ...prev,
          ...formData,
          status: "pending",
          declinedFields: response.data.declinedFields || [],
        }));
        setDeclinedFields(response.data.declinedFields || []);
        setEditMode(false);
        setShowSuccessModal(true);
        setSaveStatus((prev) => ({
          ...prev,
          final: { loading: false, success: true },
        }));
        setUpdatedDocuments({});
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Failed to update declined fields:", err);
      setSaveStatus((prev) => ({
        ...prev,
        final: {
          loading: false,
          error: err.response?.data?.message || "Failed to update profile",
        },
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
              onClick={() => {
                setShowSuccessModal(false);
                window.location.reload();
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Removed LogoutModal component since we now use SweetAlert

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const DetailCard = ({ title, children, section }) => (
    <div className="border border-gray-200 rounded-xl p-0 bg-white shadow-sm hover:shadow-md transition-shadow mb-4 w-full overflow-x-auto">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center">
        <h3 className="text-lg font-semibold text-blue-800">{title}</h3>
      </div>
      <div className="px-0 py-0">
        <table className="w-full table-fixed">
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );

  const DetailItem = ({
    label,
    value,
    field,
    section,
    subSection,
    editable = true,
  }) => {
    const isDeclined = isFieldDeclined(section, field, subSection);
    const isEditable = isFieldEditable(section, field, subSection);
    // Document fields
    const isDocument = section === "documents";
    // Format date fields
    const isDateField = /date|dob/i.test(field);
    const displayValue = isDateField ? formatDate(value) : value;

    // Use local state for editing to prevent cursor jump
    const [localValue, setLocalValue] = React.useState(value ?? "");
    React.useEffect(() => {
      if (!isEditable) setLocalValue(value ?? "");
    }, [value, isEditable]);

    if (isEditable && isDocument) {
      return (
        <tr className="border-b last:border-b-0">
          <td className="py-2 px-6 text-red-600 font-semibold w-1/3 text-left align-top">
            {label}:
          </td>
          <td className="py-2 px-6">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setUpdatedDocuments((prev) => ({ ...prev, [field]: file }));
                  setFormData((prev) => ({
                    ...prev,
                    documents: {
                      ...prev.documents,
                      [field]: URL.createObjectURL(file),
                    },
                  }));
                  const fieldPath = `documents.${field}`;
                  setUpdatedFields((prev) =>
                    prev.includes(fieldPath) ? prev : [...prev, fieldPath]
                  );
                }
              }}
              className="ml-2"
            />
            {formData.documents?.[field] && (
              <a
                href={formData.documents[field]}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 underline text-xs"
              >
                Preview
              </a>
            )}
          </td>
        </tr>
      );
    }

    if (isEditable && !isDocument) {
      return (
        <tr className="border-b last:border-b-0">
          <td className="py-2 px-6 text-red-600 font-semibold w-1/3 text-left align-top">
            {label}:
          </td>
          <td className="py-2 px-6">
            <input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={(e) => {
                const newValue = e.target.value;
                if (subSection) {
                  setFormData((prev) => ({
                    ...prev,
                    [section]: {
                      ...prev[section],
                      [subSection]: {
                        ...prev[section]?.[subSection],
                        [field]: newValue,
                      },
                    },
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    [section]: {
                      ...prev[section],
                      [field]: newValue,
                    },
                  }));
                }
                // Track updated fields
                const fieldPath = subSection
                  ? `${section}.${subSection}.${field}`
                  : `${section}.${field}`;
                if (declinedFields.includes(fieldPath)) {
                  if (!updatedFields.includes(fieldPath)) {
                    setUpdatedFields((prev) => [...prev, fieldPath]);
                  }
                }
              }}
              className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </td>
        </tr>
      );
    }

    return (
      <tr className="border-b last:border-b-0">
        <td
          className={`py-2 px-4 text-gray-600 font-medium align-top border-r border-gray-200 break-words max-w-[120px] ${isDeclined ? "text-red-600" : ""
            }`}
        >
          {label}:
        </td>
        <td
          className={`py-2 px-4 text-gray-900 font-semibold align-top break-words max-w-[220px] ${isDeclined ? "text-red-600" : ""
            }`}
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          {displayValue || <span className="text-gray-400 italic">N/A</span>}
        </td>
      </tr>
    );
  };

  // Update DocumentCard to support edit mode and declined fields
  const DocumentCard = ({
    title,
    url,
    field,
    editMode,
    isDeclined,
    onFileChange,
    previousUrl,
    newFile,
    onCancelNewFile,
  }) => {
    // Check if the document is a PDF or image
    const isPDF = url && url.toLowerCase().includes('.pdf');
    const isImage = url && (url.toLowerCase().includes('.jpg') || url.toLowerCase().includes('.jpeg') || url.toLowerCase().includes('.png') || url.toLowerCase().includes('.gif') || url.toLowerCase().includes('.webp'));

    // For previous document
    const prevIsPDF = previousUrl && previousUrl.toLowerCase().includes('.pdf');
    const prevIsImage = previousUrl && (previousUrl.toLowerCase().includes('.jpg') || previousUrl.toLowerCase().includes('.jpeg') || previousUrl.toLowerCase().includes('.png') || previousUrl.toLowerCase().includes('.gif') || previousUrl.toLowerCase().includes('.webp'));

    // For new file
    const newFileUrl = newFile ? URL.createObjectURL(newFile) : null;
    const newFileIsPDF = newFile && newFile.type === 'application/pdf';
    const newFileIsImage = newFile && newFile.type.startsWith('image');

    return (
      <div className={`rounded-xl p-4 flex flex-col bg-white hover:shadow-md transition-shadow relative ${isDeclined ? 'border-2 border-red-400' : 'border border-gray-200'}`}>
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          {title}
          {isDeclined && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded bg-red-100 text-red-700 font-semibold">Declined</span>
          )}
          {editMode && isDeclined && newFile && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 font-semibold">Ready to Re-upload</span>
          )}
        </h4>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          {/* Previous Document */}
          <div className="flex-1 flex flex-col items-center justify-center mb-2 bg-gray-50 rounded-lg overflow-hidden min-h-[120px] p-2">
            <span className="text-xs text-gray-500 mb-1">Previously Submitted</span>
            {previousUrl ? (
              prevIsImage ? (
                <img src={previousUrl} alt={title} className="max-h-24 max-w-full object-contain rounded" />
              ) : prevIsPDF ? (
                <div className="flex flex-col items-center text-gray-600">
                  <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">PDF Document</span>
                </div>
              ) : (
                <span className="text-gray-400 italic">Not viewable</span>
              )
            ) : (
              <span className="text-gray-400 italic">Not uploaded</span>
            )}
          </div>
          {/* New Upload Preview */}
          {editMode && isDeclined && (
            <div className="flex-1 flex flex-col items-center justify-center mb-2 bg-gray-50 rounded-lg overflow-hidden min-h-[120px] p-2 w-full">
              <span className="text-xs text-gray-500 mb-1">New Upload</span>
              {newFile ? (
                <>
                  {newFileIsImage ? (
                    <a
                      href={newFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 mb-2 text-center py-1 px-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                    >
                      View Document
                    </a>
                  ) : newFileIsPDF ? (
                    <a
                      href={newFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 mb-2 text-center py-1 px-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                    >
                      View Document
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">File selected</span>
                  )}
                  <button
                    className="mt-2 px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                    onClick={() => onCancelNewFile(field)}
                    type="button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <label className="w-full flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 rounded-lg py-6 bg-white hover:bg-gray-100 transition-all">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4h.01M12 20h0" />
                  </svg>
                  <span className="text-gray-700 font-medium">Upload Document</span>
                  <span className="text-xs text-gray-500">(PDF, JPG, PNG, etc.)</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => onFileChange(field, e.target.files[0])}
                  />
                </label>
              )}
            </div>
          )}
        </div>
        {/* Main Document View/Download Button (if not in edit mode or not declined) */}
        {!editMode && url && (
          isPDF ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-center py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
            >
              Download Document
            </a>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-center py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
            >
              View Document
            </a>
          )
        )}
      </div>
    );
  };

  // Helper to convert field name to label
  function fieldToLabel(field) {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/\b10th\b/, "10th")
      .replace(/\b12th\b/, "12th");
  }

  // Helper to check if a section has declined fields
  const getDeclinedSections = () => {
    const declinedSections = new Set();
    declinedFields.forEach(fieldPath => {
      const section = fieldPath.split('.')[0];
      declinedSections.add(section);
    });
    return declinedSections;
  };

  const declinedSections = getDeclinedSections();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
          <p className="text-gray-400 text-sm mt-1">
            Please wait while we fetch your information
          </p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    // If unauthorized, SweetAlert will handle it, so don't render the background alert
    if (error === "Unauthorized" || error === "Unauthorized Access") {
      return null;
    }
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
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

  // Calculate average of 10th and 12th aggregate
  const tenth = parseFloat(details.academic?.classX?.aggregate);
  const twelfth = parseFloat(details.academic?.classXII?.aggregate);
  const hasTenth = !isNaN(tenth);
  const hasTwelfth = !isNaN(twelfth);
  const academicAvg =
    hasTenth && hasTwelfth ? ((tenth + twelfth) / 2).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
              {/* Removed LogoutModal rendering since we now use SweetAlert */}
      {showSuccessModal && <SuccessModal />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back,{" "}
              <span className="font-medium text-blue-600">
                {details.personal?.firstName}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {details.personal?.status === "declined" && (
              <button
                onClick={handleEditToggle}
                className={`px-4 py-2 rounded-lg transition-all shadow-sm ${editMode
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  }`}
              >
                {editMode ? "Cancel Editing" : "Update Profile"}
              </button>
            )}
            <button
              onClick={handleBackClick}
              className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all flex items-center gap-2 shadow-sm"
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
              Logout
            </button>
          </div>
        </div>

        {/* Student Profile Summary */}
        <div
          className={`rounded-xl shadow-lg overflow-hidden mb-8 ${details.personal?.status === "declined"
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : details.personal?.status === "approved"
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : "bg-gradient-to-r from-orange-400 to-yellow-400"
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
                {details.personal?.batch && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Batch: {details.personal.batch}
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${details.personal?.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : details.personal?.status === "declined"
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
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
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-t-4 border-blue-400">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
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
                <p className="text-sm text-gray-500">Documents Uploaded</p>
                <p className="text-2xl font-bold text-gray-800">
                  {
                    Object.values(details.documents || {}).filter((doc) => doc)
                      .length
                  }
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    / {Object.keys(details.documents || {}).length}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-t-4 border-green-400">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
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
                <p className="text-sm text-gray-500">
                  Academic Status - 10th + 12th
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {hasTenth && hasTwelfth ? `${academicAvg}%` : "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {hasTenth ? `10th: ${tenth}%` : "10th: N/A"} |{" "}
                  {hasTwelfth ? `12th: ${twelfth}%` : "12th: N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-t-4 border-yellow-400">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
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
                <p className="text-sm text-gray-500">Family Income</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatFamilyIncome(details.parent?.familyIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1 mb-6">
            {["Personal", "Parent", "Academic", "Documents"].map((category) => {
              const sectionKey = category.toLowerCase();
              const hasDeclinedFields = declinedSections.has(sectionKey);

              return (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    `w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all duration-200
                    ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 relative
                    ${selected
                      ? "bg-white shadow text-blue-700"
                      : "text-gray-600 hover:bg-white/50 hover:text-blue-600"
                    }
                    ${hasDeclinedFields ? 'border-2 border-red-400' : ''}`
                  }
                >
                  <div className="relative flex items-center justify-center">
                    <span>{category}</span>
                    {hasDeclinedFields && (
                      <div className="relative ml-1 group">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse cursor-help">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                          Declined section
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </Tab>
              );
            })}
          </Tab.List>

          <Tab.Panels className="mt-2">
            {/* Personal Information Tab */}
            <Tab.Panel
              className="rounded-xl p-2 bg-white shadow"
              style={{ minHeight: 0, background: "#fff" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                <DetailCard title="Basic Information" section="personal">
                  <DetailItem
                    label="First Name"
                    value={`${formData.personal?.firstName || ""}`.trim()}
                    field="firstName"
                    section="personal"
                  />
                  <DetailItem
                    label="Middle Name"
                    value={`${formData.personal?.middleName || ""}`.trim()}
                    field="middleName"
                    section="personal"
                  />
                  <DetailItem
                    label="Last Name"
                    value={`${formData.personal?.lastName || ""}`.trim()}
                    field="lastName"
                    section="personal"
                  />
                  <DetailItem
                    label="Date of Birth"
                    value={formData.personal?.dob}
                    field="dob"
                    section="personal"
                  />
                  <DetailItem
                    label="Place of Birth"
                    value={formData.personal?.placeOfBirth}
                    field="placeOfBirth"
                    section="personal"
                  />
                  <DetailItem
                    label="Gender"
                    value={formData.personal?.gender}
                    field="gender"
                    section="personal"
                  />
                  <DetailItem
                    label="Category"
                    value={`${formData.personal?.category || ""}${formData.personal?.subCategory
                        ? ` (${formData.personal.subCategory})`
                        : ""
                      }`}
                    field="category"
                    section="personal"
                  />
                  <DetailItem
                    label="Region"
                    value={formData.personal?.region}
                    field="region"
                    section="personal"
                  />
                </DetailCard>

                <DetailCard title="Contact Information" section="personal">
                  <DetailItem
                    label="Email"
                    value={formData.personal?.email}
                    field="email"
                    section="personal"
                  />
                  <DetailItem
                    label="Mobile"
                    value={formData.personal?.mobile}
                    field="mobile"
                    section="personal"
                  />
                  <DetailItem
                    label="Current Address"
                    value={formData.personal?.currentAddress}
                    field="currentAddress"
                    section="personal"
                  />
                  <DetailItem
                    label="Permanent Address"
                    value={formData.personal?.permanentAddress}
                    field="permanentAddress"
                    section="personal"
                  />
                </DetailCard>

                <DetailCard title="Academic Information" section="personal">
                  <DetailItem
                    label="Course"
                    value={formData.personal?.course}
                    field="course"
                    section="personal"
                  />
                  <DetailItem
                    label="Exam Roll No"
                    value={formData.personal?.examRoll}
                    field="examRoll"
                    section="personal"
                  />
                  <DetailItem
                    label="Exam Rank"
                    value={formData.personal?.examRank}
                    field="examRank"
                    section="personal"
                  />
                  <DetailItem
                    label="ABC ID"
                    value={formData.personal?.abcId}
                    field="abcId"
                    section="personal"
                  />
                  <DetailItem
                    label="Fee Reimbursement"
                    value={formData.personal?.feeReimbursement}
                    field="feeReimbursement"
                    section="personal"
                  />
                  <DetailItem
                    label="Anti-Ragging Ref"
                    value={formData.personal?.antiRaggingRef}
                    field="antiRaggingRef"
                    section="personal"
                  />
                </DetailCard>
              </div>
            </Tab.Panel>

            {/* Parent Information Tab */}
            <Tab.Panel className="rounded-xl bg-white p-2 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailCard title="Father's Details" section="parent">
                  <DetailItem
                    label="Name"
                    value={formData.parent?.father?.name}
                    field="name"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Qualification"
                    value={formData.parent?.father?.qualification}
                    field="qualification"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Occupation"
                    value={formData.parent?.father?.occupation}
                    field="occupation"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Email"
                    value={formData.parent?.father?.email}
                    field="email"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Mobile"
                    value={formData.parent?.father?.mobile}
                    field="mobile"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Telephone (STD)"
                    value={formData.parent?.father?.telephoneSTD}
                    field="telephoneSTD"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Telephone"
                    value={formData.parent?.father?.telephone}
                    field="telephone"
                    section="parent"
                    subSection="father"
                  />
                  <DetailItem
                    label="Office Address"
                    value={formData.parent?.father?.officeAddress}
                    field="officeAddress"
                    section="parent"
                    subSection="father"
                  />
                </DetailCard>

                <DetailCard title="Mother's Details" section="parent">
                  <DetailItem
                    label="Name"
                    value={formData.parent?.mother?.name}
                    field="name"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Qualification"
                    value={formData.parent?.mother?.qualification}
                    field="qualification"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Occupation"
                    value={formData.parent?.mother?.occupation}
                    field="occupation"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Email"
                    value={formData.parent?.mother?.email}
                    field="email"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Mobile"
                    value={formData.parent?.mother?.mobile}
                    field="mobile"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Telephone (STD)"
                    value={formData.parent?.mother?.telephoneSTD}
                    field="telephoneSTD"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Telephone"
                    value={formData.parent?.mother?.telephone}
                    field="telephone"
                    section="parent"
                    subSection="mother"
                  />
                  <DetailItem
                    label="Office Address"
                    value={formData.parent?.mother?.officeAddress}
                    field="officeAddress"
                    section="parent"
                    subSection="mother"
                  />
                </DetailCard>

                <DetailCard title="Family Information" section="parent">
                  <DetailItem
                    label="Annual Income"
                    value={formatFamilyIncome(details.parent?.familyIncome)}
                    field="familyIncome"
                    section="parent"
                  />
                  {details.parent?.siblings?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Siblings
                      </h4>
                      <div className="space-y-2">
                        {details.parent.siblings.map((sibling, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 p-2 bg-gray-50 rounded"
                          >
                            <strong>{sibling.name}</strong> ({sibling.relation})
                            <br />
                            <span className="text-xs text-gray-500">
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
            <Tab.Panel className="rounded-xl bg-white p-2 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailCard title="Class X Details" section="academic">
                  <DetailItem
                    label="Institute"
                    value={formData.academic?.classX?.institute}
                    field="institute"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="Board"
                    value={formData.academic?.classX?.board}
                    field="board"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="Year"
                    value={formData.academic?.classX?.year}
                    field="year"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="Aggregate %"
                    value={formData.academic?.classX?.aggregate}
                    field="aggregate"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="PCM %"
                    value={formData.academic?.classX?.pcm}
                    field="pcm"
                    section="academic"
                    subSection="classX"
                  />
                  <DetailItem
                    label="Diploma/Polytechnic"
                    value={formData.academic?.classX?.isDiplomaOrPolytechnic}
                    field="isDiplomaOrPolytechnic"
                    section="academic"
                    subSection="classX"
                  />
                </DetailCard>

                <DetailCard title="Class XII Details" section="academic">
                  <DetailItem
                    label="Institute"
                    value={formData.academic?.classXII?.institute}
                    field="institute"
                    section="academic"
                    subSection="classXII"
                  />
                  <DetailItem
                    label="Board"
                    value={formData.academic?.classXII?.board}
                    field="board"
                    section="academic"
                    subSection="classXII"
                  />
                  <DetailItem
                    label="Year"
                    value={formData.academic?.classXII?.year}
                    field="year"
                    section="academic"
                    subSection="classXII"
                  />
                  <DetailItem
                    label="Aggregate %"
                    value={formData.academic?.classXII?.aggregate}
                    field="aggregate"
                    section="academic"
                    subSection="classXII"
                  />
                  <DetailItem
                    label="PCM %"
                    value={formData.academic?.classXII?.pcm}
                    field="pcm"
                    section="academic"
                    subSection="classXII"
                  />
                </DetailCard>

                {details.academic?.otherQualification?.institute && (
                  <DetailCard title="Other Qualification" section="academic">
                    <DetailItem
                      label="Institute"
                      value={formData.academic.otherQualification.institute}
                      field="institute"
                      section="academic"
                      subSection="otherQualification"
                    />
                    <DetailItem
                      label="Board"
                      value={formData.academic.otherQualification.board}
                      field="board"
                      section="academic"
                      subSection="otherQualification"
                    />
                    <DetailItem
                      label="Year"
                      value={formData.academic.otherQualification.year}
                      field="year"
                      section="academic"
                      subSection="otherQualification"
                    />
                    <DetailItem
                      label="Aggregate %"
                      value={formData.academic.otherQualification.aggregate}
                      field="aggregate"
                      section="academic"
                      subSection="otherQualification"
                    />
                    <DetailItem
                      label="PCM %"
                      value={formData.academic.otherQualification.pcm}
                      field="pcm"
                      section="academic"
                      subSection="otherQualification"
                    />
                  </DetailCard>
                )}

                {details.academic?.academicAchievements?.length > 0 && (
                  <div className="border border-gray-200 rounded-xl p-0 bg-white shadow-sm hover:shadow-md transition-shadow mb-4 w-full overflow-x-auto">
                    <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center">
                      <h3 className="text-lg font-semibold text-blue-800">
                        Academic Achievements
                      </h3>
                    </div>
                    <div className="px-4 py-4">
                      <div className="space-y-2">
                        {details.academic.academicAchievements.map(
                          (achievement, index) => (
                            <div
                              key={index}
                              className="text-sm text-gray-600 p-2 bg-gray-50 rounded break-words w-full"
                              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                            >
                              <strong>{achievement.event}</strong> ({achievement.date})<br />
                              <span className="text-xs text-gray-500">
                                {achievement.outcome}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {details.academic?.coCurricularAchievements?.length > 0 && (
                  <div className="border border-gray-200 rounded-xl p-0 bg-white shadow-sm hover:shadow-md transition-shadow mb-4 w-full overflow-x-auto">
                    <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center">
                      <h3 className="text-lg font-semibold text-blue-800">
                        Co-Curricular Achievements
                      </h3>
                    </div>
                    <div className="px-4 py-4">
                      <div className="space-y-2">
                        {details.academic.coCurricularAchievements.map(
                          (achievement, index) => (
                            <div
                              key={index}
                              className="text-sm text-gray-600 p-2 bg-gray-50 rounded break-words w-full"
                              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                            >
                              <strong>{achievement.event}</strong> ({achievement.date})<br />
                              <span className="text-xs text-gray-500">
                                {achievement.outcome}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Tab.Panel>

            {/* Documents Tab */}
            <Tab.Panel className="rounded-xl bg-white p-6 shadow">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(details.documents || {}).map(([field, url]) => (
                  <DocumentCard
                    key={field}
                    title={fieldToLabel(field)}
                    url={formData.documents?.[field] || url}
                    previousUrl={url}
                    field={field}
                    editMode={editMode}
                    isDeclined={declinedFields.includes(`documents.${field}`)}
                    newFile={updatedDocuments[field] || null}
                    onFileChange={(docField, file) => {
                      if (file) {
                        setUpdatedDocuments((prev) => ({
                          ...prev,
                          [docField]: file,
                        }));
                        setFormData((prev) => ({
                          ...prev,
                          documents: {
                            ...prev.documents,
                            [docField]: URL.createObjectURL(file),
                          },
                        }));
                        const fieldPath = `documents.${docField}`;
                        setUpdatedFields((prev) =>
                          prev.includes(fieldPath) ? prev : [...prev, fieldPath]
                        );
                      }
                    }}
                    onCancelNewFile={(docField) => {
                      setUpdatedDocuments((prev) => {
                        const copy = { ...prev };
                        delete copy[docField];
                        return copy;
                      });
                      setFormData((prev) => ({
                        ...prev,
                        documents: {
                          ...prev.documents,
                          [docField]: url,
                        },
                      }));
                      const fieldPath = `documents.${docField}`;
                      setUpdatedFields((prev) => prev.filter((f) => f !== fieldPath));
                    }}
                  />
                ))}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Final Update Button (only in edit mode for declined status) */}
        {editMode && details.personal?.status === "declined" && (
          <div className="mt-8 flex justify-end items-center">
            <div className="mr-4 text-sm text-gray-600">
              {updatedFields.length} of {declinedFields.length} required fields
              updated
            </div>
            <button
              onClick={handleUpdateDeclinedFields}
              disabled={
                !allDeclinedFieldsUpdated() || saveStatus.final?.loading
              }
              className={`px-6 py-3 text-white font-medium rounded-lg transition-all shadow-lg flex items-center gap-2 ${allDeclinedFieldsUpdated()
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
