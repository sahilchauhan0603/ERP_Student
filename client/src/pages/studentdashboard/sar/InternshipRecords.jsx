import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaExclamationCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function InternshipRecords({ internships, addRecord, updateRecord, deleteRecord }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
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
    status: "applied"
  });

  // Input states for dynamic arrays
  const [skillInput, setSkillInput] = useState("");
  const [technologyInput, setTechnologyInput] = useState("");



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
      status: "applied"
    });
    setShowAddForm(false);
    setSkillInput("");
    setTechnologyInput("");
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
      await addRecord(newInternship);
      
      // Show success message with SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Internship record created successfully!',
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

  const internshipTypes = ["summer", "winter", "part-time", "full-time", "remote", "research"];
  const workModes = ["onsite", "remote", "hybrid"];
  const currencies = ["INR", "USD", "EUR", "GBP"];
  const statuses = ["applied", "selected", "ongoing", "completed", "terminated", "declined"];
  const ratings = ["1", "2", "3", "4", "5"];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB');
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
            <div key={internship.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
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
                    onClick={() => setEditingId(internship.id)}
                    className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer"
                  >
                    <FaEdit />
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

              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                {internship.final_presentation && <span>✓ Final Presentation Given</span>}
                {internship.offer_letter_received && <span>✓ Offer Letter Received</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}