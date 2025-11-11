import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaGraduationCap, FaChartLine, FaExclamationCircle, FaCheckCircle, FaSpinner, FaInfoCircle } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function SAROverview({ student, sarData, updateSAROverview }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    enrollment_no: sarData.sarInfo.enrollment_no,
    microsoft_email: sarData.sarInfo.microsoft_email,
    current_semester: sarData.sarInfo.current_semester
  });

  // Error and loading states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      enrollment_no: sarData.sarInfo.enrollment_no,
      microsoft_email: sarData.sarInfo.microsoft_email,
      current_semester: sarData.sarInfo.current_semester
    });
  };



  // Validation function
  const validateForm = (form) => {
    const newErrors = {};
    
    if (!form.enrollment_no?.trim()) {
      newErrors.enrollment_no = "Enrollment number is required";
    }
    
    if (!form.microsoft_email?.trim()) {
      newErrors.microsoft_email = "Microsoft email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.microsoft_email)) {
      newErrors.microsoft_email = "Please enter a valid email address";
    }
    
    if (!form.current_semester) {
      newErrors.current_semester = "Current semester is required";
    } else if (isNaN(form.current_semester) || form.current_semester < 1 || form.current_semester > 8) {
      newErrors.current_semester = "Semester must be between 1 and 8";
    }
    
    return newErrors;
  };

  const handleSave = async () => {
    try {
      // Clear previous errors
      setErrors({});
      
      // Validate form data
      const validationErrors = validateForm(editForm);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        
        // Show validation errors with SweetAlert2
        const errorList = Object.values(validationErrors).join('\n');
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: `Please correct the following errors:\n${errorList}`,
          confirmButtonColor: '#dc3545'
        });
        return;
      }

      setIsSubmitting(true);
      
      // Call the parent component's updateSAROverview function
      await updateSAROverview(editForm);
      
      // Show success message with SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'SAR overview updated successfully!',
        confirmButtonColor: '#28a745'
      });
      
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating SAR overview:', error);
      
      let errorMessage = "Failed to update SAR overview. Please try again.";
      
      // Handle specific error types
      if (error.response?.data?.errorCode) {
        switch (error.response.data.errorCode) {
          case 'DUPLICATE_ENROLLMENT':
            errorMessage = "This enrollment number is already in use.";
            setErrors({ enrollment_no: "Enrollment number must be unique" });
            break;
          case 'INVALID_EMAIL_FORMAT':
            errorMessage = "Please provide a valid email address.";
            setErrors({ microsoft_email: "Invalid email format" });
            break;
          case 'MISSING_REQUIRED_FIELDS':
            errorMessage = "Please fill in all required fields.";
            break;
          default:
            errorMessage = error.response.data.message || "Failed to update SAR overview. Please try again.";
        }
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your entries and try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "You are not authorized to perform this action. Please log in again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else {
        errorMessage = "Failed to update SAR overview. Please check your connection and try again.";
      }
      
      // Show error message with SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      enrollment_no: sarData.sarInfo.enrollment_no,
      microsoft_email: sarData.sarInfo.microsoft_email,
      current_semester: sarData.sarInfo.current_semester
    });
  };

  const calculateCompletionPercentage = () => {
    let totalFields = 0;
    let filledFields = 0;

    // Check basic info
    totalFields += 2;
    if (sarData.sarInfo.enrollment_no) filledFields++;
    if (sarData.sarInfo.microsoft_email) filledFields++;

    // Check academic records (expect at least current semester)
    totalFields += sarData.sarInfo.current_semester;
    filledFields += sarData.academicRecords.length;

    // Bonus points for completed internships and achievements
    const completedInternships = sarData.internships.length;
    if (completedInternships > 0) filledFields += 2;
    if (sarData.achievements.length > 0) filledFields += 2;
    totalFields += 4; // Maximum bonus

    return Math.min(Math.round((filledFields / totalFields) * 100), 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
              <FaInfoCircle className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">SAR Overview</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Manage your academic profile and track progress</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
            >
              <FaEdit className="text-xs" /> Edit Info
            </button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              {isEditing && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                    Editing Mode
                  </span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className={`flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm flex-1 sm:flex-none justify-center ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="text-xs" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                <FaTimes className="text-xs" />
                Cancel
              </button>
            </div>
          )}
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded"></div>
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student Name
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                  {student?.firstName} {student?.middleName} {student?.lastName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                  {student?.course || "Not available"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Batch
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                  {student?.batch || "Not available"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enrollment Number
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editForm.enrollment_no}
                      onChange={(e) => setEditForm(prev => ({ ...prev, enrollment_no: e.target.value }))}
                      className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                        errors.enrollment_no
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      placeholder="Enter enrollment number"
                    />
                    {errors.enrollment_no && (
                      <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                        <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                        {errors.enrollment_no}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                    <FaGraduationCap className="text-indigo-600" />
                    <span className="text-gray-900">{sarData.sarInfo.enrollment_no || "Not set - Click Edit to add"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Personal Email
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaEnvelope className="text-blue-600" />
                  <span className="text-gray-900">{student?.email || "Not available"}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Microsoft Email
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      value={editForm.microsoft_email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, microsoft_email: e.target.value }))}
                      className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                        errors.microsoft_email
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      placeholder="Enter Microsoft email (e.g., student@bpitindia.edu.in)"
                    />
                    {errors.microsoft_email && (
                      <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                        <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                        {errors.microsoft_email}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                    <FaEnvelope className="text-green-600" />
                    <span className="text-gray-900">{sarData.sarInfo.microsoft_email || "Not set - Click Edit to add"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Semester
                </label>
                {isEditing ? (
                  <div>
                    <select
                      value={editForm.current_semester}
                      onChange={(e) => setEditForm(prev => ({ ...prev, current_semester: parseInt(e.target.value) }))}
                      className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                        errors.current_semester
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <option value="">Select Semester</option>
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                    {errors.current_semester && (
                      <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                        <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                        {errors.current_semester}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                    <FaGraduationCap className="text-blue-600" />
                    <span className="text-gray-900">Semester {sarData.sarInfo.current_semester}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-green-500 rounded"></div>
              SAR Statistics
            </h3>

            <div className="space-y-4">
              {/* Profile Completion */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
                  <span className="text-xl font-bold text-indigo-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Record Counts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-purple-600">{sarData.academicRecords.length}</div>
                  <div className="text-xs text-gray-600 mt-1">Academic Records</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {sarData.internships.length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Internships</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{sarData.achievements.length}</div>
                  <div className="text-xs text-gray-600 mt-1">Achievements</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  Recent Activity
                </h4>
                <div className="space-y-2 text-sm">
                  {sarData.academicRecords.length === 0 && sarData.internships.length === 0 && sarData.achievements.length === 0 ? (
                    <p className="text-gray-500 italic">No records added yet</p>
                  ) : (
                    <>
                      {sarData.academicRecords.length > 0 && (
                        <p className="text-gray-700 flex items-center gap-2">
                          <FaCheckCircle className="text-green-600" />
                          {sarData.academicRecords.length} academic record(s) added
                        </p>
                      )}
                      {sarData.internships.length > 0 && (
                        <p className="text-gray-700 flex items-center gap-2">
                          <FaCheckCircle className="text-blue-600" />
                          {sarData.internships.length} internship(s) recorded
                        </p>
                      )}
                      {sarData.achievements.length > 0 && (
                        <p className="text-gray-700 flex items-center gap-2">
                          <FaCheckCircle className="text-yellow-600" />
                          {sarData.achievements.length} achievement(s) documented
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-indigo-500 rounded"></div>
            Quick Actions & Goals
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <p className="text-sm font-semibold text-indigo-800 mb-1">Next Steps</p>
              <p className="text-sm text-indigo-700">
                {sarData.academicRecords.length === 0 && "Add your academic records"}
                {sarData.academicRecords.length > 0 && sarData.internships.length === 0 && "Record your completed internships"}
                {sarData.internships.length > 0 && sarData.achievements.length === 0 && "Document your achievements"}
                {sarData.achievements.length > 0 && "Keep updating your records"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-1">Completion Goal</p>
              <p className="text-sm text-green-700">Reach 100% profile completion</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-800 mb-1">Records Target</p>
              <p className="text-sm text-blue-700">All {sarData.sarInfo.current_semester} semesters documented</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}