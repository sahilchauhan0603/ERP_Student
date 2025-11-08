import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaExclamationCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
import Swal from 'sweetalert2';
import axios from 'axios';

export default function InternshipRecords({ internships, addRecord, updateRecord, deleteRecord }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  
  // Error and loading states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Internship Form
  const [newInternship, setNewInternship] = useState({
    company_name: "",
    position: "",
    internship_type: "summer",
    start_date: "",
    end_date: "",
    duration_months: "",
    duration_weeks: "",
    stipend: "",
    currency: "INR",
    location: "",
    work_mode: "onsite",
    description: "",
    key_responsibilities: "",
    skills_learned: [],
    technologies_used: [],
    supervisor_name: "",
    supervisor_designation: "",
    supervisor_email: "",
    supervisor_phone: "",
    performance_rating: "",
    final_presentation: false,
    offer_letter_received: false,
    offer_letter: "",
    status: "applied"
  });

  // Input states for dynamic arrays
  const [skillInput, setSkillInput] = useState("");
  const [technologyInput, setTechnologyInput] = useState("");
  const [offerLetterFile, setOfferLetterFile] = useState(null);
  const [uploadingOfferLetter, setUploadingOfferLetter] = useState(false);

  // Modal state for viewing images
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageTitle, setModalImageTitle] = useState("");

  // Image Modal Component
  const ImageModal = () => {
    if (!showImageModal) return null;

    return (
      <div className="fixed inset-0 bg-black/40 bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">{modalImageTitle}</h3>
            <button
              onClick={() => setShowImageModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="p-4">
            <img
              src={modalImageUrl}
              alt={modalImageTitle}
              className="max-w-full max-h-[70vh] object-contain mx-auto"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
          
          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <a
              href={modalImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open in New Tab
            </a>
            <button
              onClick={() => setShowImageModal(false)}
              className="px-4 py-2 bg-gray-600 text-white cursor-pointer rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Function to open image modal
  const openImageModal = (imageUrl, title) => {
    setModalImageUrl(imageUrl);
    setModalImageTitle(title);
    setShowImageModal(true);
  };



  // Validation function
  const validateInternship = (internship) => {
    const newErrors = {};
    
    // Required fields
    if (!internship.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }
    
    if (!internship.position.trim()) {
      newErrors.position = "Position/Role is required";
    }
    
    // Date validation
    if (internship.start_date && internship.end_date) {
      const startDate = new Date(internship.start_date);
      const endDate = new Date(internship.end_date);
      
      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }
    
    // Numeric validation
    if (internship.duration_months && (isNaN(internship.duration_months) || internship.duration_months < 0)) {
      newErrors.duration_months = "Duration must be a positive number";
    }
    
    if (internship.duration_weeks && (isNaN(internship.duration_weeks) || internship.duration_weeks < 0)) {
      newErrors.duration_weeks = "Duration must be a positive number";
    }
    
    if (internship.stipend && isNaN(internship.stipend)) {
      newErrors.stipend = "Stipend must be a valid number";
    }
    
    if (internship.performance_rating && (isNaN(internship.performance_rating) || internship.performance_rating < 1 || internship.performance_rating > 5)) {
      newErrors.performance_rating = "Rating must be between 1 and 5";
    }
    
    // Email validation
    if (internship.supervisor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(internship.supervisor_email)) {
      newErrors.supervisor_email = "Please enter a valid email address";
    }
    
    // Phone validation (basic)
    if (internship.supervisor_phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(internship.supervisor_phone)) {
      newErrors.supervisor_phone = "Please enter a valid phone number";
    }
    
    return newErrors;
  };

  // Direct Cloudinary signed upload function with axios
  const uploadToCloudinary = async (file) => {
    try {
      // Step 1: Get upload signature from backend using axios
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const signatureResponse = await axios.post(`${apiUrl}/sar/upload-signature`, {}, {
        withCredentials: true
      });

      const signatureData = signatureResponse.data;
      
      if (!signatureData.success) {
        throw new Error('Failed to generate upload signature');
      }

      // Step 2: Upload to Cloudinary with signature using axios
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signatureData.signature);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('api_key', signatureData.api_key);
      formData.append('folder', signatureData.folder);

      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return uploadResponse.data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      
      // Handle axios error responses
      if (error.response) {
        const errorMessage = error.response.data?.error?.message || 
                           error.response.data?.message || 
                           'Upload failed';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to upload file. Please try again.');
    }
  };

  const handleOfferLetterUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type - only images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload only image files (JPEG, PNG, GIF).',
        confirmButtonColor: '#dc3545'
      });
      event.target.value = ''; // Clear the input
      return;
    }

    // Validate file size (2MB max for images)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Please upload an image smaller than 2MB.',
        confirmButtonColor: '#dc3545'
      });
      event.target.value = ''; // Clear the input
      return;
    }

    // Store file locally for preview, don't upload to Cloudinary yet
    setOfferLetterFile(file);
    
    Swal.fire({
      icon: 'success',
      title: 'File Selected',
      text: 'Offer letter ready for upload. Complete the form and click "Save Internship" to upload.',
      confirmButtonColor: '#28a745'
    });
  };

  const resetForm = () => {
    setNewInternship({
      company_name: "",
      position: "",
      internship_type: "summer",
      start_date: "",
      end_date: "",
      duration_months: "",
      duration_weeks: "",
      stipend: "",
      currency: "INR",
      location: "",
      work_mode: "onsite",
      description: "",
      key_responsibilities: "",
      skills_learned: [],
      technologies_used: [],
      supervisor_name: "",
      supervisor_designation: "",
      supervisor_email: "",
      supervisor_phone: "",
      performance_rating: "",
      final_presentation: false,
      offer_letter_received: false,
      offer_letter: "",
      status: "applied"
    });
    setShowAddForm(false);
    setSkillInput("");
    setTechnologyInput("");
    setOfferLetterFile(null);
    setErrors({});
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setNewInternship(prev => ({
        ...prev,
        skills_learned: [...prev.skills_learned, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (index) => {
    setNewInternship(prev => ({
      ...prev,
      skills_learned: prev.skills_learned.filter((_, i) => i !== index)
    }));
  };

  const handleAddTechnology = () => {
    if (technologyInput.trim()) {
      setNewInternship(prev => ({
        ...prev,
        technologies_used: [...prev.technologies_used, technologyInput.trim()]
      }));
      setTechnologyInput("");
    }
  };

  const handleRemoveTechnology = (index) => {
    setNewInternship(prev => ({
      ...prev,
      technologies_used: prev.technologies_used.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitInternship = async () => {
    const internshipErrors = validateInternship(newInternship);
    
    if (Object.keys(internshipErrors).length > 0) {
      setErrors(internshipErrors);
      
      // Show validation errors with SweetAlert2
      const errorList = Object.values(internshipErrors).join('\n');
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: `Please fix the following errors:\n${errorList}`,
        confirmButtonColor: '#dc3545'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a copy of the internship data
      let internshipDataToSubmit = { ...newInternship };
      
      // Sanitize data: convert empty strings to null for numeric/optional fields
      if (!internshipDataToSubmit.performance_rating || internshipDataToSubmit.performance_rating === "") {
        internshipDataToSubmit.performance_rating = null;
      }
      // Note: Keep performance_rating as raw numeric value for server-side ENUM conversion
      
      // Sanitize other numeric fields
      if (!internshipDataToSubmit.duration_months || internshipDataToSubmit.duration_months === "") {
        internshipDataToSubmit.duration_months = null;
      } else {
        internshipDataToSubmit.duration_months = parseFloat(internshipDataToSubmit.duration_months);
      }
      
      if (!internshipDataToSubmit.duration_weeks || internshipDataToSubmit.duration_weeks === "") {
        internshipDataToSubmit.duration_weeks = null;
      } else {
        internshipDataToSubmit.duration_weeks = parseInt(internshipDataToSubmit.duration_weeks);
      }
      
      if (!internshipDataToSubmit.stipend || internshipDataToSubmit.stipend === "") {
        internshipDataToSubmit.stipend = null;
      } else {
        internshipDataToSubmit.stipend = parseFloat(internshipDataToSubmit.stipend);
      }
      
      // If there's an offer letter file, upload it to Cloudinary first
      if (offerLetterFile) {
        try {
          console.log('Uploading offer letter to Cloudinary...');
          const uploadedUrl = await uploadToCloudinary(offerLetterFile);
          console.log('Upload successful, URL received:', uploadedUrl);
          internshipDataToSubmit.offer_letter = uploadedUrl;
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: `Failed to upload offer letter: ${uploadError.message}`,
            confirmButtonColor: '#dc3545'
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      console.log('Submitting internship data:', internshipDataToSubmit);
      await addRecord(internshipDataToSubmit);
      
      // Show success message with SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: offerLetterFile 
          ? 'Internship record created successfully with offer letter uploaded!' 
          : 'Internship record created successfully!',
        confirmButtonColor: '#28a745'
      });
      
      resetForm();
    } catch (error) {
      console.error("Error creating internship record:", error);
      
      // Show error message with SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || "Failed to create internship record. Please try again.",
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    // Show confirmation dialog with SweetAlert2
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This internship record will be permanently deleted. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) {
      return;
    }
    
    try {
      await deleteRecord(recordId);
      
      // Show success message with SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Internship record deleted successfully!',
        confirmButtonColor: '#28a745'
      });
    } catch (error) {
      console.error("Error deleting internship record:", error);
      
      // Show error message with SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || "Failed to delete internship record. Please try again.",
        confirmButtonColor: '#dc3545'
      });
    }
  };

  const handleEditRecord = (record) => {
    // Use internship_id as the primary ID
    const recordId = record.internship_id || record.id;
    setEditingId(recordId);
    setEditRecord({
      ...record,
      id: recordId,
      // Format dates properly for input fields
      start_date: formatDateForInput(record.start_date),
      end_date: formatDateForInput(record.end_date),
      // Ensure arrays are properly initialized
      skills_learned: record.skills_learned || [],
      technologies_used: record.technologies_used || [],
      // Ensure offer_letter field is included
      offer_letter: record.offer_letter || ""
    });
    setErrors({});
  };

  const handleUpdateRecord = async () => {
    const recordErrors = validateInternship(editRecord);
    
    if (Object.keys(recordErrors).length > 0) {
      setErrors({ record: recordErrors });
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fix the highlighted errors before updating.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a copy of the edit record data
      let recordDataToUpdate = { ...editRecord };
      
      // Sanitize data: convert empty strings to null for numeric/optional fields
      if (!recordDataToUpdate.performance_rating || recordDataToUpdate.performance_rating === "") {
        recordDataToUpdate.performance_rating = null;
      }
      // Note: Keep performance_rating as raw numeric value for server-side ENUM conversion
      
      // Sanitize other numeric fields
      if (!recordDataToUpdate.duration_months || recordDataToUpdate.duration_months === "") {
        recordDataToUpdate.duration_months = null;
      } else {
        recordDataToUpdate.duration_months = parseFloat(recordDataToUpdate.duration_months);
      }
      
      if (!recordDataToUpdate.duration_weeks || recordDataToUpdate.duration_weeks === "") {
        recordDataToUpdate.duration_weeks = null;
      } else {
        recordDataToUpdate.duration_weeks = parseInt(recordDataToUpdate.duration_weeks);
      }
      
      if (!recordDataToUpdate.stipend || recordDataToUpdate.stipend === "") {
        recordDataToUpdate.stipend = null;
      } else {
        recordDataToUpdate.stipend = parseFloat(recordDataToUpdate.stipend);
      }
      
      // If there's a new offer letter file, upload it to Cloudinary first
      if (offerLetterFile) {
        try {
          console.log('Uploading new offer letter to Cloudinary...');
          const uploadedUrl = await uploadToCloudinary(offerLetterFile);
          console.log('Upload successful, URL received:', uploadedUrl);
          recordDataToUpdate.offer_letter = uploadedUrl;
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: `Failed to upload offer letter: ${uploadError.message}`,
            confirmButtonColor: '#dc3545'
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      await updateRecord(recordDataToUpdate.id, recordDataToUpdate);
      await Swal.fire({
        title: 'Success!',
        text: offerLetterFile 
          ? 'Internship record updated successfully with new offer letter uploaded!' 
          : 'Internship record updated successfully!',
        icon: 'success',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Great!'
      });
      handleCancelEdit();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || "Failed to update internship record. Please try again.",
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
      console.error("Error updating internship record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRecord(null);
    setOfferLetterFile(null); // Clear any selected file
    setErrors({});
  };

  const internshipTypes = ["summer", "winter", "part-time", "full-time", "remote", "research"];
  const workModes = ["onsite", "remote", "hybrid"];
  const currencies = ["INR", "USD", "EUR", "GBP"];
  const statuses = ["applied", "selected", "ongoing", "completed", "terminated", "declined"];
  const ratings = ["1", "2", "3", "4", "5"];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Helper function to format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'selected': return 'bg-purple-100 text-purple-800';
      case 'applied': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBriefcase className="text-blue-600" />
          Internship Records
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Add Internship
        </button>
      </div>



      {/* Add Internship Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Internship</h3>
          
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={newInternship.company_name}
                onChange={(e) => setNewInternship(prev => ({ ...prev, company_name: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.company_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
                required
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  {errors.company_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <input
                type="text"
                value={newInternship.position}
                onChange={(e) => setNewInternship(prev => ({ ...prev, position: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter position/role"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internship Type</label>
              <select
                value={newInternship.internship_type}
                onChange={(e) => setNewInternship(prev => ({ ...prev, internship_type: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {internshipTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={newInternship.start_date}
                onChange={(e) => setNewInternship(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={newInternship.end_date}
                onChange={(e) => setNewInternship(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={newInternship.duration_months}
                onChange={(e) => setNewInternship(prev => ({ ...prev, duration_months: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Weeks)</label>
              <input
                type="number"
                min="0"
                value={newInternship.duration_weeks}
                onChange={(e) => setNewInternship(prev => ({ ...prev, duration_weeks: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stipend</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={newInternship.stipend}
                  onChange={(e) => setNewInternship(prev => ({ ...prev, stipend: e.target.value }))}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <select
                  value={newInternship.currency}
                  onChange={(e) => setNewInternship(prev => ({ ...prev, currency: e.target.value }))}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={newInternship.location}
                onChange={(e) => setNewInternship(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
              <select
                value={newInternship.work_mode}
                onChange={(e) => setNewInternship(prev => ({ ...prev, work_mode: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {workModes.map(mode => (
                  <option key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newInternship.status}
                onChange={(e) => setNewInternship(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Performance Rating (1-5)</label>
              <select
                value={newInternship.performance_rating}
                onChange={(e) => setNewInternship(prev => ({ ...prev, performance_rating: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Rating</option>
                {ratings.map(rating => (
                  <option key={rating} value={rating}>{rating} Star{rating !== '1' ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description and Responsibilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newInternship.description}
                onChange={(e) => setNewInternship(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Describe your internship experience..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities</label>
              <textarea
                value={newInternship.key_responsibilities}
                onChange={(e) => setNewInternship(prev => ({ ...prev, key_responsibilities: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="List your main responsibilities..."
              />
            </div>
          </div>

          {/* Skills and Technologies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills Learned</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newInternship.skills_learned.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={technologyInput}
                  onChange={(e) => setTechnologyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTechnology()}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a technology and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTechnology}
                  className="px-3 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newInternship.technologies_used.map((tech, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {tech}
                    <button
                      onClick={() => handleRemoveTechnology(index)}
                      className="text-green-600 hover:text-green-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Supervisor Information */}
          <div className="bg-white rounded-lg p-4 mb-6 border">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Supervisor Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Supervisor Name"
                value={newInternship.supervisor_name}
                onChange={(e) => setNewInternship(prev => ({ ...prev, supervisor_name: e.target.value }))}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Supervisor Designation"
                value={newInternship.supervisor_designation}
                onChange={(e) => setNewInternship(prev => ({ ...prev, supervisor_designation: e.target.value }))}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Supervisor Email"
                value={newInternship.supervisor_email}
                onChange={(e) => setNewInternship(prev => ({ ...prev, supervisor_email: e.target.value }))}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Supervisor Phone"
                value={newInternship.supervisor_phone}
                onChange={(e) => setNewInternship(prev => ({ ...prev, supervisor_phone: e.target.value }))}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Offer Letter Upload */}
          <div className="bg-white rounded-lg p-4 mb-6 border">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Offer Letter</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Offer Letter Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOfferLetterUpload}
                    disabled={uploadingOfferLetter}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="offer-letter-upload"
                  />
                  <label
                    htmlFor="offer-letter-upload"
                    className="block w-full px-4 py-3 border-2 border-dashed border-gray-400 rounded-xl transition-colors duration-300 cursor-pointer bg-white hover:border-blue-500"
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <svg
                        className="w-8 h-8 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">
                        {offerLetterFile ? (
                          <span className="text-green-600">File selected: {offerLetterFile.name}</span>
                        ) : (
                          "Click to select offer letter"
                        )}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        JPEG, PNG, or GIF (max 2MB). Upload on save.
                      </span>
                    </div>
                  </label>
                </div>
                {uploadingOfferLetter && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-blue-600">
                    <FaSpinner className="animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
                {offerLetterFile && (
                  <div className="mt-3 flex flex-col items-center space-y-2">
                    <button
                      onClick={() => {
                        const fileUrl = URL.createObjectURL(offerLetterFile);
                        openImageModal(fileUrl, `Selected File: ${offerLetterFile.name}`);
                      }}
                      className="inline-flex items-center cursor-pointer px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📄 View Selected File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOfferLetterFile(null);
                        // Clear the file input
                        const fileInput = document.getElementById('offer-letter-upload');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="text-xs cursor-pointer text-red-600 hover:text-red-800"
                    >
                      Remove Selected File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newInternship.final_presentation}
                onChange={(e) => setNewInternship(prev => ({ ...prev, final_presentation: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Final Presentation Given</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newInternship.offer_letter_received}
                onChange={(e) => setNewInternship(prev => ({ ...prev, offer_letter_received: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Offer Letter Received</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitInternship}
              disabled={isSubmitting || !newInternship.company_name || !newInternship.position}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              } text-white`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Internship
                </>
              )}
            </button>
            <button
              onClick={resetForm}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-gray-600 hover:bg-gray-700 cursor-pointer text-white'
              }`}
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Internship Form */}
      {editingId && editRecord && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-amber-800">
              Edit Internship Record - {editRecord.company_name}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-amber-600 hover:text-amber-800 cursor-pointer"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={editRecord.company_name}
                onChange={(e) => setEditRecord(prev => ({ ...prev, company_name: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.record?.company_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
                required
              />
              {errors.record?.company_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  {errors.record.company_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position/Role *</label>
              <input
                type="text"
                value={editRecord.position}
                onChange={(e) => setEditRecord(prev => ({ ...prev, position: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.record?.position ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter position/role"
                required
              />
              {errors.record?.position && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  {errors.record.position}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internship Type</label>
              <select
                value={editRecord.internship_type}
                onChange={(e) => setEditRecord(prev => ({ ...prev, internship_type: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {internshipTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={editRecord.start_date}
                onChange={(e) => setEditRecord(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={editRecord.end_date}
                onChange={(e) => setEditRecord(prev => ({ ...prev, end_date: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.record?.end_date ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.record?.end_date && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  {errors.record.end_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={editRecord.duration_months}
                onChange={(e) => setEditRecord(prev => ({ ...prev, duration_months: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Duration in months"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stipend</label>
              <input
                type="number"
                min="0"
                value={editRecord.stipend}
                onChange={(e) => setEditRecord(prev => ({ ...prev, stipend: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Monthly stipend amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={editRecord.currency}
                onChange={(e) => setEditRecord(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={editRecord.location}
                onChange={(e) => setEditRecord(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="City, State/Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
              <select
                value={editRecord.work_mode}
                onChange={(e) => setEditRecord(prev => ({ ...prev, work_mode: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {workModes.map(mode => (
                  <option key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editRecord.status}
                onChange={(e) => setEditRecord(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Performance Rating (1-5)</label>
              <select
                value={editRecord.performance_rating}
                onChange={(e) => setEditRecord(prev => ({ ...prev, performance_rating: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Rating</option>
                {ratings.map(rating => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating !== "1" ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editRecord.description}
                onChange={(e) => setEditRecord(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Brief description of the internship role and company..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities</label>
              <textarea
                value={editRecord.key_responsibilities}
                onChange={(e) => setEditRecord(prev => ({ ...prev, key_responsibilities: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="List your main responsibilities and tasks..."
              />
            </div>
          </div>

          {/* Offer Letter Upload for Edit */}
          <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
            <h4 className="text-md font-semibold text-amber-800 mb-3">Offer Letter</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Offer Letter Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files[0];
                      if (!file) return;

                      // Validate file type - only images
                      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                      if (!allowedTypes.includes(file.type)) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Invalid File Type',
                          text: 'Please upload only image files (JPEG, PNG, GIF).',
                          confirmButtonColor: '#dc3545'
                        });
                        event.target.value = ''; // Clear the input
                        return;
                      }

                      // Validate file size (2MB max for images)
                      if (file.size > 2 * 1024 * 1024) {
                        Swal.fire({
                          icon: 'error',
                          title: 'File Too Large',
                          text: 'Please upload an image smaller than 2MB.',
                          confirmButtonColor: '#dc3545'
                        });
                        event.target.value = ''; // Clear the input
                        return;
                      }

                      // Store file locally for preview, don't upload to Cloudinary yet
                      setOfferLetterFile(file);
                      
                      Swal.fire({
                        icon: 'success',
                        title: 'File Selected',
                        text: 'New offer letter ready for upload. Click "Update Record" to upload.',
                        confirmButtonColor: '#28a745'
                      });
                    }}
                    disabled={uploadingOfferLetter}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="edit-offer-letter-upload"
                  />
                  <label
                    htmlFor="edit-offer-letter-upload"
                    className="block w-full px-4 py-3 border-2 border-dashed border-amber-400 rounded-xl transition-colors duration-300 cursor-pointer bg-amber-50 hover:border-amber-500"
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <svg
                        className="w-8 h-8 text-amber-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">
                        {offerLetterFile ? (
                          <span className="text-green-600">New file selected: {offerLetterFile.name}</span>
                        ) : editRecord.offer_letter ? (
                          <span className="text-blue-600">Current file uploaded</span>
                        ) : (
                          "Click to select new offer letter"
                        )}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        JPEG, PNG, or GIF (max 2MB). Upload on update.
                      </span>
                    </div>
                  </label>
                </div>
                {uploadingOfferLetter && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-amber-600">
                    <FaSpinner className="animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
                
                <div className="mt-3 flex flex-col items-center space-y-2">
                  {/* Show new file selection if available */}
                  {offerLetterFile && (
                    <>
                      <button
                        onClick={() => {
                          const fileUrl = URL.createObjectURL(offerLetterFile);
                          openImageModal(fileUrl, `Selected File: ${offerLetterFile.name}`);
                        }}
                        className="inline-flex items-center cursor-pointer px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        📄 View New Selected File
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOfferLetterFile(null);
                          // Clear the file input
                          const fileInput = document.getElementById('edit-offer-letter-upload');
                          if (fileInput) fileInput.value = '';
                        }}
                        className="text-xs cursor-pointer text-red-600 hover:text-red-800"
                      >
                        Remove Selected File
                      </button>
                    </>
                  )}
                  
                  {/* Show current uploaded file if available and no new file selected */}
                  {editRecord.offer_letter && !offerLetterFile && (
                    <>
                      <button
                        onClick={() => openImageModal(editRecord.offer_letter, "Current Offer Letter")}
                        className="inline-flex items-center cursor-pointer px-3 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        📄 View Current Document
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditRecord(prev => ({ ...prev, offer_letter: "" }))}
                        className="text-xs cursor-pointer text-red-600 hover:text-red-800"
                      >
                        Remove Current Document
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpdateRecord}
              disabled={isSubmitting || !editRecord.company_name || !editRecord.position}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 cursor-pointer'
              } text-white`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave />
                  Update Record
                </>
              )}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-gray-600 hover:bg-gray-700 cursor-pointer text-white'
              }`}
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Internships */}
      <div className="space-y-4">
        {internships.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FaBriefcase className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Internships Added</h3>
            <p className="text-gray-500 mb-4">Start documenting your professional experience and internships.</p>
          </div>
        ) : (
          internships.map((internship) => (
            <div key={internship.id} className={`bg-white border rounded-lg p-6 shadow-sm ${
              editingId === (internship.internship_id || internship.id)
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{internship.position}</h3>
                  <p className="text-blue-600 font-medium">{internship.company_name}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt /> {internship.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> {formatDate(internship.start_date)} - {formatDate(internship.end_date)}
                    </span>
                    {internship.performance_rating && (
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" /> {internship.performance_rating}/5
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(internship.status)}`}>
                    {internship.status}
                  </span>
                  <button
                    onClick={() => editingId === (internship.internship_id || internship.id) ? handleCancelEdit() : handleEditRecord(internship)}
                    className={`p-2 cursor-pointer rounded transition-colors ${
                      editingId === (internship.internship_id || internship.id) 
                        ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-100' 
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                    title={editingId === (internship.internship_id || internship.id) ? "Cancel Edit" : "Edit Record"}
                  >
                    {editingId === (internship.internship_id || internship.id) ? <FaTimes /> : <FaEdit />}
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(internship.internship_id)}
                    className="text-red-600 hover:text-red-800 p-2 cursor-pointer hover:bg-red-50 rounded transition-colors"
                    title="Delete Record"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-sm">
                  <span className="text-gray-500">Type:</span> {internship.internship_type}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Duration:</span> 
                  {internship.duration_months && ` ${internship.duration_months} months`}
                  {internship.duration_weeks && ` ${internship.duration_weeks} weeks`}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Work Mode:</span> {internship.work_mode}
                </div>
                {internship.stipend && (
                  <div className="text-sm">
                    <span className="text-gray-500">Stipend:</span> {internship.stipend} {internship.currency}
                  </div>
                )}
              </div>

              {internship.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{internship.description}</p>
                </div>
              )}

              {internship.key_responsibilities && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Responsibilities</h4>
                  <p className="text-sm text-gray-600">{internship.key_responsibilities}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internship.skills_learned && internship.skills_learned.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Learned</h4>
                    <div className="flex flex-wrap gap-1">
                      {internship.skills_learned.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {internship.technologies_used && internship.technologies_used.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Technologies Used</h4>
                    <div className="flex flex-wrap gap-1">
                      {internship.technologies_used.map((tech, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {internship.supervisor_name && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Supervisor</h4>
                  <p className="text-sm text-gray-600">
                    {internship.supervisor_name}
                    {internship.supervisor_designation && ` - ${internship.supervisor_designation}`}
                    {internship.supervisor_email && ` (${internship.supervisor_email})`}
                  </p>
                </div>
              )}

              {(internship.offer_letter || internship.offer_letter_received) && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Offer Letter</h4>
                  {internship.offer_letter ? (
                    <button
                      onClick={() => openImageModal(internship.offer_letter, `Offer Letter - ${internship.company_name}`)}
                      className="inline-flex items-center cursor-pointer gap-2 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-2 rounded-lg transition-colors hover:bg-blue-100"
                    >
                      📄 View Offer Letter
                    </button>
                  ) : (
                    <div className="text-sm text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg">
                      Offer letter received but not uploaded to system
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                {internship.final_presentation && <span>✓ Final Presentation Given</span>}
                {internship.offer_letter_received && <span>✓ Offer Letter Received</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Modal */}
      <ImageModal />
    </div>
  );
}