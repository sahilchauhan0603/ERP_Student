import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaVenusMars, FaHome, FaGraduationCap, FaCalendarAlt, FaExclamationCircle, FaSpinner, FaCamera, FaImage, FaEye } from "react-icons/fa";
import Swal from 'sweetalert2';
import axios from 'axios';

export default function StudentInfo({ student, updateStudentInfo }) {
  const courses = [
    "B.Tech Computer Science Engineering (CSE)",
    "B.Tech Information Technology Engineering (IT)",
    "B.Tech Electronics and Communication Engineering (ECE)",
    "B.Tech Electrical and Electronics Engineering (EEE)",
    "B.Tech Artificial Intelligence and Data Science Engineering (AI-DS)",
    "B.Tech Computer Science Engineering with specialization in Data Science (CSE-DS)",
    "LE-B.Tech Computer Science Engineering (CSE)",
    "LE-B.Tech Information Technology Engineering (IT)",
    "LE-B.Tech Electronics and Communication Engineering (ECE)",
    "LE-B.Tech Electrical and Electronics Engineering (EEE)",
    "BBA",
    "MBA",
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: student?.firstName || '',
    middleName: student?.middleName || '',
    lastName: student?.lastName || '',
    email: student?.email || '',
    mobile: student?.mobile || '',
    dob: student?.dob ? student.dob.split('T')[0] : '',
    placeOfBirth: student?.placeOfBirth || '',
    gender: student?.gender || '',
    currentAddress: student?.currentAddress || '',
    course: student?.course || '',
    batch: student?.batch || '',
    photo: student?.photo || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      firstName: student?.firstName || '',
      middleName: student?.middleName || '',
      lastName: student?.lastName || '',
      email: student?.email || '',
      mobile: student?.mobile || '',
      dob: student?.dob ? student.dob.split('T')[0] : '',
      placeOfBirth: student?.placeOfBirth || '',
      gender: student?.gender || '',
      currentAddress: student?.currentAddress || '',
      course: student?.course || '',
      batch: student?.batch || '',
      photo: student?.photo || ''
    });
  };

  const validateForm = (form) => {
    const newErrors = {};

    if (!form.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!form.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!form.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.mobile?.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(form.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!form.dob) {
      newErrors.dob = "Date of birth is required";
    }

    if (!form.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!form.course?.trim()) {
      newErrors.course = "Course is required";
    }

    if (!form.batch?.trim()) {
      newErrors.batch = "Batch is required";
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

      // Upload photo to Cloudinary if a new file was selected
      let photoUrl = editForm.photo;
      if (photoFile) {
        setUploadingPhoto(true);
        try {
          photoUrl = await uploadToCloudinary(photoFile);
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Photo Upload Failed',
            text: 'Failed to upload photo. Please try again.',
            confirmButtonColor: '#dc3545'
          });
          setUploadingPhoto(false);
          setIsSubmitting(false);
          return;
        }
        setUploadingPhoto(false);
      }

      // Update student info with the photo URL
      await updateStudentInfo({ ...editForm, photo: photoUrl });

      // Success - close edit mode (success alert is shown by SARContainer)
      setPhotoFile(null);
      setIsEditing(false);

    } catch (error) {
      console.error('Error updating student info:', error);

      // Only show error if it's an actual error (not success)
      let errorMessage = "Failed to update student information. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
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
    setPhotoFile(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select an image file',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image size should not exceed 5MB',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    // Store the file locally (will upload to Cloudinary on save)
    setPhotoFile(file);
    
    Swal.fire({
      icon: 'info',
      title: 'Photo Selected',
      text: 'Photo will be uploaded when you click Save',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Direct Cloudinary signed upload function with axios
  const uploadToCloudinary = async (file) => {
    try {
      // Step 1: Get signature from backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const signatureResponse = await axios.post(
        `${apiUrl}/sar/upload-signature`,
        { folder: 'student_photos' },
        { withCredentials: true }
      );

      const { signature, timestamp, cloud_name, api_key } = signatureResponse.data;

      // Step 2: Upload to Cloudinary with signature
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', api_key);
      formData.append('folder', 'student_photos');

      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return uploadResponse.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/40 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowPhotoModal(false)}>
            <div className="relative bg-white rounded-lg p-2 max-w-md" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="absolute cursor-pointer -top-3 -right-3 bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 shadow-lg transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
              {(student?.photo || editForm.photo) ? (
                <img
                  src={student?.photo || editForm.photo}
                  alt="Student"
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="20">Image Not Available</text></svg>';
                  }}
                />
              ) : (
                <div className="w-96 h-96 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <FaImage className="text-gray-400 text-6xl mb-3" />
                  <p className="text-gray-500 font-medium">No Photo Available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-600 rounded-lg shadow-md">
              <FaUser className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Information</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Manage your personal details</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
            >
              <FaEdit className="text-xs" /> Edit Info
            </button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className={`flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm flex-1 sm:flex-none justify-center ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-pink-600 hover:bg-pink-700 text-white'
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

        <div className={`rounded-lg shadow-lg border p-4 sm:p-6 ${
          isEditing 
            ? 'bg-pink-50 border-pink-400' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-4 bg-pink-500 rounded"></div>
              Personal Information
            </h3>
            {isEditing && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-pink-600 text-white rounded-full text-xs font-semibold">
                  Editing Mode
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Photo Field - Full Width */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Photo
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  {(photoFile || student?.photo || editForm.photo) ? (
                    <div className="relative group">
                      <img
                        src={photoFile ? URL.createObjectURL(photoFile) : (editForm.photo || student?.photo)}
                        alt="Student"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                      />
                      <button
                        onClick={() => setShowPhotoModal(true)}
                        className="absolute inset-0 cursor-pointer bg-black/40 bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <FaEye className="text-white text-2xl" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <FaImage className="text-gray-400 text-3xl" />
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                {isEditing && (
                  <div className="flex-1">
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-pink-300 bg-pink-50 hover:bg-pink-100 transition-colors text-pink-700 font-medium text-sm w-fit ${
                          uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                        }`}>
                          {uploadingPhoto ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <FaCamera />
                              {photoFile ? 'Change Photo' : ((student?.photo || editForm.photo) ? 'Change Photo' : 'Upload Photo')}
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                      {photoFile ? (
                        <p className="text-xs text-pink-600 font-medium">
                          📷 Photo ready. Click Save to upload.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                        </p>
                      )}
                      {(editForm.photo || photoFile) && (
                        <button
                          onClick={() => {
                            setEditForm(prev => ({ ...prev, photo: '' }));
                            setPhotoFile(null);
                          }}
                          className="text-xs cursor-pointer text-red-600 hover:text-red-700 font-medium w-fit"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!isEditing && !(student?.photo || editForm.photo) && (
                  <div className="text-sm text-gray-500">
                    No photo uploaded
                  </div>
                )}
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 ${
                      errors.firstName
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaUser className="text-pink-600" />
                  <span className="text-gray-900">{student?.firstName || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Middle Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.middleName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, middleName: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 hover:border-gray-300"
                  placeholder="Enter middle name"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaUser className="text-pink-600" />
                  <span className="text-gray-900">{student?.middleName || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 ${
                      errors.lastName
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaUser className="text-pink-600" />
                  <span className="text-gray-900">{student?.lastName || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 ${
                      errors.email
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.email}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaEnvelope className="text-blue-600" />
                  <span className="text-gray-900">{student?.email || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 ${
                      errors.mobile
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.mobile}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaPhone className="text-green-600" />
                  <span className="text-gray-900">{student?.mobile || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 ${
                      errors.dob
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  />
                  {errors.dob && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.dob}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaBirthdayCake className="text-pink-600" />
                  <span className="text-gray-900">{formatDate(student?.dob)}</span>
                </div>
              )}
            </div>

            {/* Place of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Place of Birth
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.placeOfBirth}
                  onChange={(e) => setEditForm(prev => ({ ...prev, placeOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 hover:border-gray-300"
                  placeholder="Enter place of birth"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-600" />
                  <span className="text-gray-900">{student?.placeOfBirth || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender *
              </label>
              {isEditing ? (
                <div>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 ${
                      errors.gender
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.gender}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaVenusMars className="text-indigo-600" />
                  <span className="text-gray-900">{student?.gender || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course *
              </label>
              {isEditing ? (
                <div>
                  <select
                    value={editForm.course}
                    onChange={(e) => setEditForm(prev => ({ ...prev, course: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 ${
                      errors.course
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <option value="">Select Course</option>
                    {courses.map((course, index) => (
                      <option key={index} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                  {errors.course && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.course}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaGraduationCap className="text-blue-600" />
                  <span className="text-gray-900">{student?.course || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Batch */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Batch *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editForm.batch}
                    onChange={(e) => setEditForm(prev => ({ ...prev, batch: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 ${
                      errors.batch
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    placeholder="e.g., 2021-2025"
                  />
                  {errors.batch && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded mt-1">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.batch}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <FaCalendarAlt className="text-orange-600" />
                  <span className="text-gray-900">{student?.batch || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Current Address - Full Width */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Address
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.currentAddress}
                  onChange={(e) => setEditForm(prev => ({ ...prev, currentAddress: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 hover:border-gray-300"
                  rows="3"
                  placeholder="Enter current residential address"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2">
                  <FaHome className="text-teal-600 mt-1" />
                  <span className="text-gray-900">{student?.currentAddress || "Not set"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
