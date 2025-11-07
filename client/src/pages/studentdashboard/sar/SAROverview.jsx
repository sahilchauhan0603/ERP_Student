import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaGraduationCap, FaChartLine, FaExclamationCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
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

    // Bonus points for internships and achievements
    if (sarData.internships.length > 0) filledFields += 2;
    if (sarData.achievements.length > 0) filledFields += 2;
    totalFields += 4; // Maximum bonus

    return Math.min(Math.round((filledFields / totalFields) * 100), 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">SAR Overview</h2>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <FaEdit /> Edit Info
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center cursor-pointer justify-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center cursor-pointer justify-center gap-2 px-3 md:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm md:text-base"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        )}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
            <FaUser className="text-blue-600 text-sm md:text-base" />
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name
              </label>
              <div className="p-3 bg-white rounded-lg border">
                {student?.firstName} {student?.middleName} {student?.lastName}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Number
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editForm.enrollment_no}
                    onChange={(e) => setEditForm(prev => ({ ...prev, enrollment_no: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.enrollment_no
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter enrollment number"
                  />
                  {errors.enrollment_no && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationCircle /> {errors.enrollment_no}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg border">
                  {sarData.sarInfo.enrollment_no || "Not set - Click Edit to add"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Email
              </label>
              <div className="p-3 bg-white rounded-lg border flex items-center gap-2">
                <FaEnvelope className="text-blue-600" />
                {student?.email || "Not available"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Microsoft Email
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    value={editForm.microsoft_email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, microsoft_email: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.microsoft_email
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter Microsoft email (e.g., student@bpitindia.edu.in)"
                  />
                  {errors.microsoft_email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationCircle /> {errors.microsoft_email}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg border flex items-center gap-2">
                  <FaEnvelope className="text-green-600" />
                  {sarData.sarInfo.microsoft_email || "Not set - Click Edit to add"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Semester
              </label>
              {isEditing ? (
                <div>
                  <select
                    value={editForm.current_semester}
                    onChange={(e) => setEditForm(prev => ({ ...prev, current_semester: parseInt(e.target.value) }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.current_semester
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                  {errors.current_semester && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationCircle /> {errors.current_semester}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg border flex items-center gap-2">
                  <FaGraduationCap className="text-blue-600" />
                  Semester {sarData.sarInfo.current_semester}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-600 text-sm md:text-base" />
            SAR Statistics
          </h3>

          <div className="space-y-4">
            {/* Profile Completion */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-lg font-bold text-blue-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Record Counts */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-blue-600">{sarData.academicRecords.length}</div>
                <div className="text-xs text-gray-600">Academic Records</div>
              </div>
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-green-600">{sarData.internships.length}</div>
                <div className="text-xs text-gray-600">Internships</div>
              </div>
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-purple-600">{sarData.achievements.length}</div>
                <div className="text-xs text-gray-600">Achievements</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {sarData.academicRecords.length === 0 && sarData.internships.length === 0 && sarData.achievements.length === 0 ? (
                  <p className="text-gray-500 italic">No records added yet</p>
                ) : (
                  <>
                    {sarData.academicRecords.length > 0 && (
                      <p>✓ {sarData.academicRecords.length} academic record(s) added</p>
                    )}
                    {sarData.internships.length > 0 && (
                      <p>✓ {sarData.internships.length} internship(s) recorded</p>
                    )}
                    {sarData.achievements.length > 0 && (
                      <p>✓ {sarData.achievements.length} achievement(s) documented</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-sm text-blue-700">
            <strong>Next Steps:</strong>
            {sarData.academicRecords.length === 0 && " Add your academic records"}
            {sarData.academicRecords.length > 0 && sarData.internships.length === 0 && " Record your internships"}
            {sarData.internships.length > 0 && sarData.achievements.length === 0 && " Document your achievements"}
            {sarData.achievements.length > 0 && " Keep updating your records"}
          </div>
          <div className="text-sm text-blue-700">
            <strong>Completion Goal:</strong> Reach 100% profile completion
          </div>
          <div className="text-sm text-blue-700">
            <strong>Records Target:</strong> All {sarData.sarInfo.current_semester} semesters documented
          </div>
        </div>
      </div>
    </div>
  );
}