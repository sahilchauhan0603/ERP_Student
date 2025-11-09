import React, { useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaExclamationCircle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

export default function InternshipRecords({
  internships,
  addRecord,
  updateRecord,
  deleteRecord,
}) {
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
    status: "applied",
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
            <h3 className="text-lg font-semibold text-gray-800">
              {modalImageTitle}
            </h3>
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
                e.target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
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
    if (
      internship.duration_months &&
      (isNaN(internship.duration_months) || internship.duration_months < 0)
    ) {
      newErrors.duration_months = "Duration must be a positive number";
    }

    if (
      internship.duration_weeks &&
      (isNaN(internship.duration_weeks) || internship.duration_weeks < 0)
    ) {
      newErrors.duration_weeks = "Duration must be a positive number";
    }

    if (internship.stipend && isNaN(internship.stipend)) {
      newErrors.stipend = "Stipend must be a valid number";
    }

    if (
      internship.performance_rating &&
      (isNaN(internship.performance_rating) ||
        internship.performance_rating < 1 ||
        internship.performance_rating > 5)
    ) {
      newErrors.performance_rating = "Rating must be between 1 and 5";
    }

    // Email validation
    if (
      internship.supervisor_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(internship.supervisor_email)
    ) {
      newErrors.supervisor_email = "Please enter a valid email address";
    }

    // Phone validation (basic)
    if (
      internship.supervisor_phone &&
      !/^\+?[\d\s\-\(\)]{10,}$/.test(internship.supervisor_phone)
    ) {
      newErrors.supervisor_phone = "Please enter a valid phone number";
    }

    return newErrors;
  };

  // Direct Cloudinary signed upload function with axios
  const uploadToCloudinary = async (file) => {
    try {
      // Step 1: Get upload signature from backend using axios
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const signatureResponse = await axios.post(
        `${apiUrl}/sar/upload-signature`,
        {},
        {
          withCredentials: true,
        }
      );

      const signatureData = signatureResponse.data;

      if (!signatureData.success) {
        throw new Error("Failed to generate upload signature");
      }

      // Step 2: Upload to Cloudinary with signature using axios
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signatureData.signature);
      formData.append("timestamp", signatureData.timestamp);
      formData.append("api_key", signatureData.api_key);
      formData.append("folder", signatureData.folder);

      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return uploadResponse.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);

      // Handle axios error responses
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.message ||
          error.response.data?.message ||
          "Upload failed";
        throw new Error(errorMessage);
      }

      throw new Error("Failed to upload file. Please try again.");
    }
  };
  const handleOfferLetterUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type - only images
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please upload only image files (JPEG, PNG, GIF).",
        confirmButtonColor: "#dc3545",
      });
      event.target.value = ""; // Clear the input
      return;
    }

    // Validate file size (2MB max for images)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Please upload an image smaller than 2MB.",
        confirmButtonColor: "#dc3545",
      });
      event.target.value = ""; // Clear the input
      return;
    }

    // Store file locally for preview, don't upload to Cloudinary yet
    setOfferLetterFile(file);

    Swal.fire({
      icon: "success",
      title: "File Selected",
      text: 'Offer letter ready for upload. Complete the form and click "Save Internship" to upload.',
      confirmButtonColor: "#28a745",
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
      status: "applied",
    });
    setShowAddForm(false);
    setSkillInput("");
    setTechnologyInput("");
    setOfferLetterFile(null);
    setErrors({});
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setNewInternship((prev) => ({
        ...prev,
        skills_learned: [...prev.skills_learned, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };
  const handleRemoveSkill = (index) => {
    setNewInternship((prev) => ({
      ...prev,
      skills_learned: prev.skills_learned.filter((_, i) => i !== index),
    }));
  };

  const handleAddTechnology = () => {
    if (technologyInput.trim()) {
      setNewInternship((prev) => ({
        ...prev,
        technologies_used: [...prev.technologies_used, technologyInput.trim()],
      }));
      setTechnologyInput("");
    }
  };
  const handleRemoveTechnology = (index) => {
    setNewInternship((prev) => ({
      ...prev,
      technologies_used: prev.technologies_used.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitInternship = async () => {
    const internshipErrors = validateInternship(newInternship);

    if (Object.keys(internshipErrors).length > 0) {
      setErrors(internshipErrors);

      // Show validation errors with SweetAlert2
      const errorList = Object.values(internshipErrors).join("\n");
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: `Please fix the following errors:\n${errorList}`,
        confirmButtonColor: "#dc3545",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a copy of the internship data
      let internshipDataToSubmit = { ...newInternship };

      // Sanitize data: convert empty strings to null for numeric/optional fields
      if (
        !internshipDataToSubmit.performance_rating ||
        internshipDataToSubmit.performance_rating === ""
      ) {
        internshipDataToSubmit.performance_rating = null;
      }
      // Note: Keep performance_rating as raw numeric value for server-side ENUM conversion

      // Sanitize other numeric fields
      if (
        !internshipDataToSubmit.duration_months ||
        internshipDataToSubmit.duration_months === ""
      ) {
        internshipDataToSubmit.duration_months = null;
      } else {
        internshipDataToSubmit.duration_months = parseFloat(
          internshipDataToSubmit.duration_months
        );
      }

      if (
        !internshipDataToSubmit.duration_weeks ||
        internshipDataToSubmit.duration_weeks === ""
      ) {
        internshipDataToSubmit.duration_weeks = null;
      } else {
        internshipDataToSubmit.duration_weeks = parseInt(
          internshipDataToSubmit.duration_weeks
        );
      }

      if (
        !internshipDataToSubmit.stipend ||
        internshipDataToSubmit.stipend === ""
      ) {
        internshipDataToSubmit.stipend = null;
      } else {
        internshipDataToSubmit.stipend = parseFloat(
          internshipDataToSubmit.stipend
        );
      }

      // If there's an offer letter file, upload it to Cloudinary first
      if (offerLetterFile) {
        try {
          console.log("Uploading offer letter to Cloudinary...");
          const uploadedUrl = await uploadToCloudinary(offerLetterFile);
          console.log("Upload successful, URL received:", uploadedUrl);
          internshipDataToSubmit.offer_letter = uploadedUrl;
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: `Failed to upload offer letter: ${uploadError.message}`,
            confirmButtonColor: "#dc3545",
          });
          setIsSubmitting(false);
          return;
        }
      }

      console.log("Submitting internship data:", internshipDataToSubmit);
      await addRecord(internshipDataToSubmit);

      // Show success message with SweetAlert2
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: offerLetterFile
          ? "Internship record created successfully with offer letter uploaded!"
          : "Internship record created successfully!",
        confirmButtonColor: "#28a745",
      });

      resetForm();
    } catch (error) {
      console.error("Error creating internship record:", error);

      // Show error message with SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "Failed to create internship record. Please try again.",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    // Show confirmation dialog with SweetAlert2
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This internship record will be permanently deleted. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteRecord(recordId);

      // Show success message with SweetAlert2
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Internship record deleted successfully!",
        confirmButtonColor: "#28a745",
      });
    } catch (error) {
      console.error("Error deleting internship record:", error);

      // Show error message with SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "Failed to delete internship record. Please try again.",
        confirmButtonColor: "#dc3545",
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
      skills_learned: Array.isArray(record.skills_learned)
        ? record.skills_learned
        : typeof record.skills_learned === "string"
        ? record.skills_learned.split(",").map((s) => s.trim())
        : [],
      technologies_used: Array.isArray(record.technologies_used)
        ? record.technologies_used
        : typeof record.technologies_used === "string"
        ? record.technologies_used.split(",").map((t) => t.trim())
        : [],
      // Ensure offer_letter field is included
      offer_letter: record.offer_letter || "",
    });
    setSkillInput("");
    setTechnologyInput("");
    setOfferLetterFile(null);
    setErrors({});
  };

  const handleEditAddSkill = () => {
    if (skillInput.trim() && editRecord) {
      setEditRecord((prev) => ({
        ...prev,
        skills_learned: [...(prev.skills_learned || []), skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleEditRemoveSkill = (index) => {
    setEditRecord((prev) => ({
      ...prev,
      skills_learned: (prev.skills_learned || []).filter((_, i) => i !== index),
    }));
  };

  const handleEditAddTechnology = () => {
    if (technologyInput.trim() && editRecord) {
      setEditRecord((prev) => ({
        ...prev,
        technologies_used: [
          ...(prev.technologies_used || []),
          technologyInput.trim(),
        ],
      }));
      setTechnologyInput("");
    }
  };

  const handleEditRemoveTechnology = (index) => {
    setEditRecord((prev) => ({
      ...prev,
      technologies_used: (prev.technologies_used || []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleUpdateRecord = async () => {
    const recordErrors = validateInternship(editRecord);

    if (Object.keys(recordErrors).length > 0) {
      setErrors({ record: recordErrors });
      Swal.fire({
        title: "Validation Error",
        text: "Please fix the highlighted errors before updating.",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a copy of the edit record data
      let recordDataToUpdate = { ...editRecord };

      // Sanitize data: convert empty strings to null for numeric/optional fields
      if (
        !recordDataToUpdate.performance_rating ||
        recordDataToUpdate.performance_rating === ""
      ) {
        recordDataToUpdate.performance_rating = null;
      }
      // Note: Keep performance_rating as raw numeric value for server-side ENUM conversion

      // Sanitize other numeric fields
      if (
        !recordDataToUpdate.duration_months ||
        recordDataToUpdate.duration_months === ""
      ) {
        recordDataToUpdate.duration_months = null;
      } else {
        recordDataToUpdate.duration_months = parseFloat(
          recordDataToUpdate.duration_months
        );
      }

      if (
        !recordDataToUpdate.duration_weeks ||
        recordDataToUpdate.duration_weeks === ""
      ) {
        recordDataToUpdate.duration_weeks = null;
      } else {
        recordDataToUpdate.duration_weeks = parseInt(
          recordDataToUpdate.duration_weeks
        );
      }

      if (!recordDataToUpdate.stipend || recordDataToUpdate.stipend === "") {
        recordDataToUpdate.stipend = null;
      } else {
        recordDataToUpdate.stipend = parseFloat(recordDataToUpdate.stipend);
      }

      // If there's a new offer letter file, upload it to Cloudinary first
      if (offerLetterFile) {
        try {
          console.log("Uploading new offer letter to Cloudinary...");
          const uploadedUrl = await uploadToCloudinary(offerLetterFile);
          console.log("Upload successful, URL received:", uploadedUrl);
          recordDataToUpdate.offer_letter = uploadedUrl;
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: `Failed to upload offer letter: ${uploadError.message}`,
            confirmButtonColor: "#dc3545",
          });
          setIsSubmitting(false);
          return;
        }
      }

      await updateRecord(recordDataToUpdate.id, recordDataToUpdate);
      await Swal.fire({
        title: "Success!",
        text: offerLetterFile
          ? "Internship record updated successfully with new offer letter uploaded!"
          : "Internship record updated successfully!",
        icon: "success",
        confirmButtonColor: "#10B981",
        confirmButtonText: "Great!",
      });
      handleCancelEdit();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error.message ||
          "Failed to update internship record. Please try again.",
        icon: "error",
        confirmButtonColor: "#EF4444",
        confirmButtonText: "OK",
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
    setSkillInput("");
    setTechnologyInput("");
    setErrors({});
  };

  const internshipTypes = [
    "summer",
    "winter",
    "part-time",
    "full-time",
    "remote",
    "research",
  ];
  const workModes = ["onsite", "remote", "hybrid"];
  const currencies = ["INR", "USD", "EUR", "GBP"];
  const statuses = [
    "applied",
    "selected",
    "ongoing",
    "completed",
    "terminated",
    "declined",
  ];
  const ratings = ["1", "2", "3", "4", "5"];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Helper function to format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "selected":
        return "bg-purple-100 text-purple-800";
      case "applied":
        return "bg-yellow-100 text-yellow-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <FaBriefcase className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Internship Records
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">
                Manage your professional experience
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
          >
            <FaPlus className="text-xs" /> Add Internship
          </button>
        </div>

        {/* Add Internship Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded-md">
                  <FaPlus className="text-green-600 text-sm" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Add New Internship
                </h3>
              </div>
              <button
                onClick={resetForm}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Basic Information */}
            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Basic Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={newInternship.company_name}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        company_name: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.company_name
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    placeholder="Enter company name"
                    required
                  />
                  {errors.company_name && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.company_name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={newInternship.position}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.position
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    placeholder="Enter position/role"
                    required
                  />
                  {errors.position && (
                    <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                      <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                      {errors.position}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Internship Type
                  </label>
                  <select
                    value={newInternship.internship_type}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        internship_type: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.internship_type
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {internshipTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newInternship.start_date}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.start_date
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newInternship.end_date}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.end_date
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newInternship.duration_months}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        duration_months: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.duration_months
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Additional Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Duration (Weeks)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newInternship.duration_weeks}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        duration_weeks: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.duration_weeks
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Stipend & Currency
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={newInternship.stipend}
                      onChange={(e) =>
                        setNewInternship((prev) => ({
                          ...prev,
                          stipend: e.target.value,
                        }))
                      }
                      className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                        errors.stipend
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      placeholder="Amount"
                    />
                    <select
                      value={newInternship.currency}
                      onChange={(e) =>
                        setNewInternship((prev) => ({
                          ...prev,
                          currency: e.target.value,
                        }))
                      }
                      className="px-2 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                    >
                      {currencies.map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newInternship.location}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.location
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    placeholder="City, Country"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Work Mode
                  </label>
                  <select
                    value={newInternship.work_mode}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        work_mode: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.work_mode
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {workModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    value={newInternship.status}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.status
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Performance Rating (1-5)
                  </label>
                  <select
                    value={newInternship.performance_rating}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        performance_rating: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.performance_rating
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <option value="">Select Rating</option>
                    {ratings.map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating !== "1" ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description and Responsibilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 mt-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={newInternship.description}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.description
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    rows="3"
                    placeholder="Describe your internship experience..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Key Responsibilities
                  </label>
                  <textarea
                    value={newInternship.key_responsibilities}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        key_responsibilities: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.key_responsibilities
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    rows="3"
                    placeholder="List your main responsibilities..."
                  />
                </div>
              </div>

              {/* Skills and Technologies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
               
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Skills Learned
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
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
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      >
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

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Technologies Used
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={technologyInput}
                      onChange={(e) => setTechnologyInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddTechnology()
                      }
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
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
                  <div className="flex flex-wrap gap-1">
                    {newInternship.technologies_used.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      >
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
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border">
                <h4 className="text-md font-semibold text-gray-800 mb-2">
                  Supervisor Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Supervisor Name"
                    value={newInternship.supervisor_name}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        supervisor_name: e.target.value,
                      }))
                    }
                    className={`px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.supervisor_name
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Supervisor Designation"
                    value={newInternship.supervisor_designation}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        supervisor_designation: e.target.value,
                      }))
                    }
                    className={`px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.supervisor_designation
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  />
                  <input
                    type="email"
                    placeholder="Supervisor Email"
                    value={newInternship.supervisor_email}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        supervisor_email: e.target.value,
                      }))
                    }
                    className={`px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.supervisor_email
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  />
                  <input
                    type="tel"
                    placeholder="Supervisor Phone"
                    value={newInternship.supervisor_phone}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        supervisor_phone: e.target.value,
                      }))
                    }
                    className={`px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                      errors.supervisor_phone
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* Offer Letter Upload */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border">
                <h4 className="text-md font-semibold text-gray-800 mb-2">
                  Offer Letter
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                        className="block w-full px-3 py-2 border-2 border-dashed border-gray-400 rounded-lg transition-colors duration-300 cursor-pointer bg-white hover:border-blue-500"
                      >
                        <div className="flex flex-col items-center justify-center text-center">
                          <svg
                            className="w-6 h-6 text-gray-400 mb-1"
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
                              <span className="text-green-600">
                                File selected: {offerLetterFile.name}
                              </span>
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
                            const fileUrl =
                              URL.createObjectURL(offerLetterFile);
                            openImageModal(
                              fileUrl,
                              `Selected File: ${offerLetterFile.name}`
                            );
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
                            const fileInput = document.getElementById(
                              "offer-letter-upload"
                            );
                            if (fileInput) fileInput.value = "";
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
              <div className="flex gap-3 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newInternship.final_presentation}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        final_presentation: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Final Presentation Given
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newInternship.offer_letter_received}
                    onChange={(e) =>
                      setNewInternship((prev) => ({
                        ...prev,
                        offer_letter_received: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Offer Letter Received
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Save button clicked!"); // Debug log
                    handleSubmitInternship();
                  }}
                  disabled={
                    isSubmitting ||
                    !newInternship.company_name ||
                    !newInternship.position
                  }
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="text-sm" />
                      Save Internship
                    </>
                  )}
                </button>
                <button
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? "bg-gray-300 cursor-not-allowed text-gray-500"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                  }`}
                >
                  <FaTimes className="text-sm" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Internships */}
        <div className="space-y-10">
          {internships.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBriefcase className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Internships Added
                </h3>
                <p className="text-gray-500 mb-4">
                  Start documenting your professional experience and
                  internships.
                </p>
              </div>
            </div>
          ) : (
            internships.map((internship) => {
              const internshipId = internship.internship_id || internship.id;
              const isEditing = editingId === internshipId && editRecord;

              return (
                <div
                  key={internshipId}
                  className={`border rounded-lg p-4 transition-all ${
                    isEditing
                      ? "border-blue-400 bg-blue-50 shadow-lg"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Header with Edit/Delete buttons */}
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-3 mb-4">
                    {!isEditing ? (
                      <>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {internship.position}
                              </h3>
                              <p className="text-base font-medium text-blue-600 mb-2">
                                {internship.company_name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  internship.status
                                )}`}
                              >
                                {internship.status.charAt(0).toUpperCase() +
                                  internship.status.slice(1)}
                              </span>
                              {internship.performance_rating && (
                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                                  <FaStar className="text-yellow-500 text-sm" />
                                  <span className="text-sm font-medium text-yellow-700">
                                    {internship.performance_rating}/5
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                              <FaMapMarkerAlt className="text-gray-400" />
                              {internship.location || "Remote"}
                            </span>
                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                              <FaCalendarAlt className="text-gray-400" />
                              {formatDate(internship.start_date)} -{" "}
                              {formatDate(internship.end_date)}
                            </span>
                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                              <FaBriefcase className="text-gray-400" />
                              {internship.work_mode.charAt(0).toUpperCase() +
                                internship.work_mode.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditRecord(internship)}
                            className="p-2 cursor-pointer text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                            title="Edit Record"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(internshipId)}
                            className="p-2 cursor-pointer text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded transition-colors"
                            title="Delete Record"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                              Editing Mode
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleUpdateRecord}
                            disabled={
                              isSubmitting ||
                              !editRecord.company_name ||
                              !editRecord.position
                            }
                            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                              isSubmitting ||
                              !editRecord.company_name ||
                              !editRecord.position
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
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
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer text-sm"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {!isEditing ? (
                    /* Read-only Display */
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Type</p>
                          <p className="font-semibold text-gray-900">
                            {internship.internship_type}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Duration</p>
                          <p className="font-semibold text-gray-900">
                            {internship.duration_months &&
                              `${internship.duration_months} months `}
                            (
                            {internship.duration_weeks &&
                              `${internship.duration_weeks} weeks`}
                            )
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Work Mode
                          </p>
                          <p className="font-semibold text-gray-900">
                            {internship.work_mode}
                          </p>
                        </div>
                        {internship.stipend && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">
                              Stipend
                            </p>
                            <p className="font-semibold text-gray-900">
                              {internship.stipend} {internship.currency}
                            </p>
                          </div>
                        )}
                      </div>

                      {internship.description && (
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <div className="w-1 h-4 bg-blue-500 rounded"></div>
                            Description
                          </h4>
                          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                            {internship.description}
                          </p>
                        </div>
                      )}

                      {internship.key_responsibilities && (
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <div className="w-1 h-4 bg-green-500 rounded"></div>
                            Key Responsibilities
                          </h4>
                          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                            {internship.key_responsibilities}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        {internship.skills_learned &&
                          internship.skills_learned.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                Skills Learned
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {internship.skills_learned.map(
                                  (skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {internship.technologies_used &&
                          internship.technologies_used.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                Technologies Used
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {internship.technologies_used.map(
                                  (tech, index) => (
                                    <span
                                      key={index}
                                      className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                                    >
                                      {tech}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      {internship.supervisor_name && (
                        <div className="border-t border-gray-200 pt-4 mb-4">
                          <h4 className="text-base font-semibold text-gray-800 mb-3">
                            Supervisor Information
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700">
                              <span className="font-semibold">
                                {internship.supervisor_name}
                              </span>
                              {internship.supervisor_designation && (
                                <span className="text-gray-600">
                                  {" "}
                                  - {internship.supervisor_designation}
                                </span>
                              )}
                              {internship.supervisor_email && (
                                <span className="block text-sm text-gray-600 mt-1">
                                  {internship.supervisor_email}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {(internship.offer_letter ||
                        internship.offer_letter_received) && (
                        <div className="border-t border-gray-200 pt-4 mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <div className="w-1 h-4 bg-indigo-500 rounded"></div>
                            Offer Letter
                          </h4>
                          {internship.offer_letter ? (
                            <button
                              onClick={() =>
                                openImageModal(
                                  internship.offer_letter,
                                  `Offer Letter - ${internship.company_name}`
                                )
                              }
                              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors border border-blue-200"
                            >
                              📄 View Offer Letter
                            </button>
                          ) : (
                            <div className="text-sm text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                              Offer letter received but not uploaded to system
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                        {internship.final_presentation && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                            ✓ Final Presentation Given
                          </span>
                        )}
                        {internship.offer_letter_received && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            ✓ Offer Letter Received
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Inline Edit Form */
                    <>
                      {/* Basic Information */}
                      <div className="mb-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Basic Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Company Name *
                            </label>
                            <input
                              type="text"
                              value={editRecord.company_name}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  company_name: e.target.value,
                                }))
                              }
                              className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                                errors.record?.company_name
                                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                              placeholder="Enter company name"
                              required
                            />
                            {errors.record?.company_name && (
                              <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                                <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                                {errors.record.company_name}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Position *
                            </label>
                            <input
                              type="text"
                              value={editRecord.position}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  position: e.target.value,
                                }))
                              }
                              className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                                errors.record?.position
                                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                              placeholder="Enter position/role"
                              required
                            />
                            {errors.record?.position && (
                              <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                                <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                                {errors.record.position}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Internship Type
                            </label>
                            <select
                              value={editRecord.internship_type}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  internship_type: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                            >
                              {internshipTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={editRecord.start_date}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  start_date: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={editRecord.end_date}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  end_date: e.target.value,
                                }))
                              }
                              className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                                errors.record?.end_date
                                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            />
                            {errors.record?.end_date && (
                              <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                                <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                                {errors.record.end_date}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Duration (Months)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={editRecord.duration_months || ""}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  duration_months: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Duration (Weeks)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editRecord.duration_weeks || ""}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  duration_weeks: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Stipend & Currency
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="0"
                                value={editRecord.stipend || ""}
                                onChange={(e) =>
                                  setEditRecord((prev) => ({
                                    ...prev,
                                    stipend: e.target.value,
                                  }))
                                }
                                className="flex-1 px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                                placeholder="Amount"
                              />
                              <select
                                value={editRecord.currency}
                                onChange={(e) =>
                                  setEditRecord((prev) => ({
                                    ...prev,
                                    currency: e.target.value,
                                  }))
                                }
                                className="px-2 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                              >
                                {currencies.map((curr) => (
                                  <option key={curr} value={curr}>
                                    {curr}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Location
                            </label>
                            <input
                              type="text"
                              value={editRecord.location || ""}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  location: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                              placeholder="City, Country"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Work Mode
                            </label>
                            <select
                              value={editRecord.work_mode}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  work_mode: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                            >
                              {workModes.map((mode) => (
                                <option key={mode} value={mode}>
                                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Status
                            </label>
                            <select
                              value={editRecord.status}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  status: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              Performance Rating (1-5)
                            </label>
                            <select
                              value={editRecord.performance_rating || ""}
                              onChange={(e) =>
                                setEditRecord((prev) => ({
                                  ...prev,
                                  performance_rating: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                            >
                              <option value="">Select Rating</option>
                              {ratings.map((rating) => (
                                <option key={rating} value={rating}>
                                  {rating} Star{rating !== "1" ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Description and Responsibilities */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-semibold text-gray-700">
                            Description
                          </label>
                          <textarea
                            value={editRecord.description || ""}
                            onChange={(e) =>
                              setEditRecord((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                            rows="3"
                            placeholder="Describe your internship experience..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-semibold text-gray-700">
                            Key Responsibilities
                          </label>
                          <textarea
                            value={editRecord.key_responsibilities || ""}
                            onChange={(e) =>
                              setEditRecord((prev) => ({
                                ...prev,
                                key_responsibilities: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                            rows="3"
                            placeholder="List your main responsibilities..."
                          />
                        </div>
                      </div>

                      {/* Skills and Technologies */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-semibold text-gray-700">
                            Skills Learned
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleEditAddSkill()
                              }
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                              placeholder="Add a skill and press Enter"
                            />
                            <button
                              type="button"
                              onClick={handleEditAddSkill}
                              className="px-3 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(editRecord.skills_learned || []).map(
                              (skill, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                                >
                                  {skill}
                                  <button
                                    onClick={() => handleEditRemoveSkill(index)}
                                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-semibold text-gray-700">
                            Technologies Used
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={technologyInput}
                              onChange={(e) =>
                                setTechnologyInput(e.target.value)
                              }
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleEditAddTechnology()
                              }
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                              placeholder="Add a technology and press Enter"
                            />
                            <button
                              type="button"
                              onClick={handleEditAddTechnology}
                              className="px-2 py-1 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(editRecord.technologies_used || []).map(
                              (tech, index) => (
                                <span
                                  key={index}
                                  className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                                >
                                  {tech}
                                  <button
                                    onClick={() =>
                                      handleEditRemoveTechnology(index)
                                    }
                                    className="text-green-600 hover:text-green-800 cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Supervisor Information */}
                      <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
                        <h4 className="text-md font-semibold text-gray-800 mb-2">
                          Supervisor Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Supervisor Name"
                            value={editRecord.supervisor_name || ""}
                            onChange={(e) =>
                              setEditRecord((prev) => ({
                                ...prev,
                                supervisor_name: e.target.value,
                              }))
                            }
                            className="px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                          />
                          <input
                            type="text"
                            placeholder="Supervisor Designation"
                            value={editRecord.supervisor_designation || ""}
                            onChange={(e) =>
                              setEditRecord((prev) => ({
                                ...prev,
                                supervisor_designation: e.target.value,
                              }))
                            }
                            className="px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                          />
                          <input
                            type="email"
                            placeholder="Supervisor Email"
                            value={editRecord.supervisor_email || ""}
                            onChange={(e) =>
                              setEditRecord((prev) => ({
                                ...prev,
                                supervisor_email: e.target.value,
                              }))
                            }
                            className="px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                          />
                          <input
                            type="tel"
                            placeholder="Supervisor Phone"
                            value={editRecord.supervisor_phone || ""}
                            onChange={(e) =>
                              setEditRecord((prev) => ({
                                ...prev,
                                supervisor_phone: e.target.value,
                              }))
                            }
                            className="px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300"
                          />
                        </div>
                      </div>

                      {/* Offer Letter Upload */}
                      <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
                        <h4 className="text-md font-semibold text-gray-800 mb-2">
                          Offer Letter
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Upload Offer Letter Image
                            </label>
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  const file = event.target.files[0];
                                  if (!file) return;

                                  const allowedTypes = [
                                    "image/jpeg",
                                    "image/jpg",
                                    "image/png",
                                    "image/gif",
                                  ];
                                  if (!allowedTypes.includes(file.type)) {
                                    Swal.fire({
                                      icon: "error",
                                      title: "Invalid File Type",
                                      text: "Please upload only image files (JPEG, PNG, GIF).",
                                      confirmButtonColor: "#dc3545",
                                    });
                                    event.target.value = "";
                                    return;
                                  }

                                  if (file.size > 2 * 1024 * 1024) {
                                    Swal.fire({
                                      icon: "error",
                                      title: "File Too Large",
                                      text: "Please upload an image smaller than 2MB.",
                                      confirmButtonColor: "#dc3545",
                                    });
                                    event.target.value = "";
                                    return;
                                  }

                                  setOfferLetterFile(file);
                                  Swal.fire({
                                    icon: "success",
                                    title: "File Selected",
                                    text: 'New offer letter ready for upload. Click "Save" to upload.',
                                    confirmButtonColor: "#28a745",
                                    timer: 2000,
                                    timerProgressBar: true,
                                    showConfirmButton: false,
                                    toast: true,
                                    position: "top-end",
                                  });
                                }}
                                disabled={uploadingOfferLetter}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                id={`edit-offer-letter-upload-${internshipId}`}
                              />
                              <label
                                htmlFor={`edit-offer-letter-upload-${internshipId}`}
                                className="block w-full px-3 py-2 border-2 border-dashed border-gray-400 rounded-lg transition-colors duration-300 cursor-pointer bg-white hover:border-blue-500"
                              >
                                <div className="flex flex-col items-center justify-center text-center">
                                  <svg
                                    className="w-6 h-6 text-gray-400 mb-1"
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
                                      <span className="text-green-600">
                                        File selected: {offerLetterFile.name}
                                      </span>
                                    ) : editRecord.offer_letter ? (
                                      <span className="text-blue-600">
                                        Current file uploaded
                                      </span>
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
                                    const fileUrl =
                                      URL.createObjectURL(offerLetterFile);
                                    openImageModal(
                                      fileUrl,
                                      `Selected File: ${offerLetterFile.name}`
                                    );
                                  }}
                                  className="inline-flex items-center cursor-pointer px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  📄 View Selected File
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOfferLetterFile(null);
                                    const fileInput = document.getElementById(
                                      `edit-offer-letter-upload-${internshipId}`
                                    );
                                    if (fileInput) fileInput.value = "";
                                  }}
                                  className="text-xs cursor-pointer text-red-600 hover:text-red-800"
                                >
                                  Remove Selected File
                                </button>
                              </div>
                            )}
                            {editRecord.offer_letter && !offerLetterFile && (
                              <div className="mt-3 flex flex-col items-center space-y-2">
                                <button
                                  onClick={() =>
                                    openImageModal(
                                      editRecord.offer_letter,
                                      "Current Offer Letter"
                                    )
                                  }
                                  className="inline-flex items-center cursor-pointer px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                  📄 View Current Document
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditRecord((prev) => ({
                                      ...prev,
                                      offer_letter: "",
                                    }))
                                  }
                                  className="text-xs cursor-pointer text-red-600 hover:text-red-800"
                                >
                                  Remove Current Document
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="flex gap-3 mb-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editRecord.final_presentation || false}
                            onChange={(e) =>
                              setEditRecord((prev) => ({
                                ...prev,
                                final_presentation: e.target.checked,
                              }))
                            }
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">
                            Final Presentation Given
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editRecord.offer_letter_received || false}
                            onChange={(e) =>
                              setEditRecord((prev) => ({
                                ...prev,
                                offer_letter_received: e.target.checked,
                              }))
                            }
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">
                            Offer Letter Received
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Image Modal */}
        <ImageModal />
      </div>
    </div>
  );
}
