import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaUserTie, FaEnvelope, FaPhone, FaBriefcase, FaBuilding, FaMoneyBillWave, FaExclamationCircle, FaSpinner, FaMale, FaFemale } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function ParentsInfo({ student, updateParentsInfo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fatherName: student?.father_name || '',
    fatherOccupation: student?.father_occupation || '',
    fatherEmail: student?.father_email || '',
    fatherMobile: student?.father_mobile || '',
    fatherOfficeAddress: student?.father_officeAddress || '',
    motherName: student?.mother_name || '',
    motherOccupation: student?.mother_occupation || '',
    motherEmail: student?.mother_email || '',
    motherMobile: student?.mother_mobile || '',
    motherOfficeAddress: student?.mother_officeAddress || '',
    familyIncome: student?.familyIncome || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      fatherName: student?.father_name || '',
      fatherOccupation: student?.father_occupation || '',
      fatherEmail: student?.father_email || '',
      fatherMobile: student?.father_mobile || '',
      fatherOfficeAddress: student?.father_officeAddress || '',
      motherName: student?.mother_name || '',
      motherOccupation: student?.mother_occupation || '',
      motherEmail: student?.mother_email || '',
      motherMobile: student?.mother_mobile || '',
      motherOfficeAddress: student?.mother_officeAddress || '',
      familyIncome: student?.familyIncome || ''
    });
  };

  const validateForm = (form) => {
    const newErrors = {};

    // Father's details validation
    if (!form.fatherName?.trim()) {
      newErrors.fatherName = "Father's name is required";
    }

    if (form.fatherEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.fatherEmail)) {
      newErrors.fatherEmail = "Please enter a valid email address";
    }

    if (form.fatherMobile && !/^[0-9]{10}$/.test(form.fatherMobile.replace(/\s/g, ''))) {
      newErrors.fatherMobile = "Mobile number must be 10 digits";
    }

    // Mother's details validation
    if (!form.motherName?.trim()) {
      newErrors.motherName = "Mother's name is required";
    }

    if (form.motherEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.motherEmail)) {
      newErrors.motherEmail = "Please enter a valid email address";
    }

    if (form.motherMobile && !/^[0-9]{10}$/.test(form.motherMobile.replace(/\s/g, ''))) {
      newErrors.motherMobile = "Mobile number must be 10 digits";
    }

    return newErrors;
  };

  const handleSave = async () => {
    try {
      setErrors({});

      const validationErrors = validateForm(editForm);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);

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

      await updateParentsInfo(editForm);

      setIsEditing(false);

    } catch (error) {
      console.error('Error updating parents info:', error);

      let errorMessage = "Failed to update parents information. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

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
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-600 rounded-lg shadow-md">
              <FaUserTie className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Parents Information</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Manage your parents' details</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
            >
              <FaEdit className="text-xs" /> Edit Info
            </button>
          ) : (            
            <div className="flex gap-2 w-full sm:w-auto">
            {isEditing && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
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
                    : 'bg-green-600 hover:bg-green-700 text-white'
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

        {/* Father's Information Section */}
        <div className={`rounded-lg shadow-lg border p-4 sm:p-6 mb-6 ${
          isEditing 
            ? 'bg-green-50 border-green-400' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-4 bg-green-500 rounded"></div>
              <FaMale className="text-blue-600" />
              Father's Information
            </h3>
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Father's Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editForm.fatherName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fatherName: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 ${
                      errors.fatherName
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter father's name"
                  />
                  {errors.fatherName && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.fatherName}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaUserTie className="text-green-600" />
                  <span className="text-gray-900">{student?.father_name || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Father's Occupation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Occupation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.fatherOccupation}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fatherOccupation: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 hover:border-gray-300"
                  placeholder="Enter father's occupation"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaBriefcase className="text-green-600" />
                  <span className="text-gray-900">{student?.father_occupation || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Father's Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    value={editForm.fatherEmail}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fatherEmail: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 ${
                      errors.fatherEmail
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter father's email"
                  />
                  {errors.fatherEmail && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.fatherEmail}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaEnvelope className="text-blue-600" />
                  <span className="text-gray-900">{student?.father_email || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Father's Mobile */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={editForm.fatherMobile}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fatherMobile: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 ${
                      errors.fatherMobile
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                  {errors.fatherMobile && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.fatherMobile}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaPhone className="text-green-600" />
                  <span className="text-gray-900">{student?.father_mobile || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Father's Office Address - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Office Address
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.fatherOfficeAddress}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fatherOfficeAddress: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 hover:border-gray-300"
                  rows="2"
                  placeholder="Enter father's office address"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2">
                  <FaBuilding className="text-green-600 mt-1" />
                  <span className="text-gray-900">{student?.father_officeAddress || "Not set"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mother's Information Section */}
        <div className={`rounded-lg shadow-lg border p-4 sm:p-6 mb-6 ${
          isEditing 
            ? 'bg-green-50 border-green-400' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-4 bg-green-500 rounded"></div>
              <FaFemale className="text-pink-600" />
              Mother's Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mother's Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editForm.motherName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, motherName: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 ${
                      errors.motherName
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter mother's name"
                  />
                  {errors.motherName && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.motherName}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaUserTie className="text-green-600" />
                  <span className="text-gray-900">{student?.mother_name || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Mother's Occupation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Occupation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.motherOccupation}
                  onChange={(e) => setEditForm(prev => ({ ...prev, motherOccupation: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 hover:border-gray-300"
                  placeholder="Enter mother's occupation"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaBriefcase className="text-green-600" />
                  <span className="text-gray-900">{student?.mother_occupation || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Mother's Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    value={editForm.motherEmail}
                    onChange={(e) => setEditForm(prev => ({ ...prev, motherEmail: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 ${
                      errors.motherEmail
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter mother's email"
                  />
                  {errors.motherEmail && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.motherEmail}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaEnvelope className="text-blue-600" />
                  <span className="text-gray-900">{student?.mother_email || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Mother's Mobile */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={editForm.motherMobile}
                    onChange={(e) => setEditForm(prev => ({ ...prev, motherMobile: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 ${
                      errors.motherMobile
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                  {errors.motherMobile && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.motherMobile}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaPhone className="text-green-600" />
                  <span className="text-gray-900">{student?.mother_mobile || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Mother's Office Address - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Office Address
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.motherOfficeAddress}
                  onChange={(e) => setEditForm(prev => ({ ...prev, motherOfficeAddress: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 hover:border-gray-300"
                  rows="2"
                  placeholder="Enter mother's office address"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2">
                  <FaBuilding className="text-green-600 mt-1" />
                  <span className="text-gray-900">{student?.mother_officeAddress || "Not set"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Family Income Section */}
        <div className={`rounded-lg shadow-lg border p-4 sm:p-6 ${
          isEditing 
            ? 'bg-green-50 border-green-400' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-4 bg-green-500 rounded"></div>
              Family Income
            </h3>
          </div>

          <div className="max-w-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Annual Family Income
            </label>
            {isEditing ? (
              <select
                value={editForm.familyIncome}
                onChange={(e) => setEditForm(prev => ({ ...prev, familyIncome: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 hover:border-gray-300"
              >
                <option value="">Select Income Range</option>
                <option value="1-5 Lakhs">1-5 Lakhs</option>
                <option value="5-7 Lakhs">5-7 Lakhs</option>
                <option value="7-10 Lakhs">7-10 Lakhs</option>
                <option value="Above 10 Lakhs">Above 10 Lakhs</option>
              </select>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                <span className="text-gray-900">{student?.familyIncome || "Not set"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
