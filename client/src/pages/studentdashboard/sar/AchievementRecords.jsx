import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaTrophy, FaMedal, FaCertificate, FaAward, FaExclamationCircle, FaCheckCircle, FaSpinner, FaCalendarAlt } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function AchievementRecords({ achievements, addRecord, updateRecord, deleteRecord }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  
  // Error and loading states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Achievement Form
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    category: "academic",
    subcategory: "",
    description: "",
    achievement_date: "",
    date_of_event: "",
    level: "college",
    organization: "",
    event_name: "",
    position_rank: "",
    total_participants: "",
    team_size: 1,
    team_members: [],
    prize_amount: "",
    prize_currency: "INR",
    certificate_url: "",
    trophy_medal_received: false,
    media_coverage: false,
    media_urls: [],
    skills_demonstrated: [],
    technologies_used: [],
    tags: [],
    semester_achieved: ""
  });

  // Input states for dynamic arrays
  const [teamMemberInput, setTeamMemberInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [technologyInput, setTechnologyInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [mediaUrlInput, setMediaUrlInput] = useState("");



  // Validation function
  const validateAchievement = (achievement) => {
    const newErrors = {};
    
    if (!achievement.title.trim()) {
      newErrors.title = "Achievement title is required";
    }
    
    if (!achievement.organization.trim()) {
      newErrors.organization = "Organization name is required";
    }
    
    if (!achievement.achievement_date) {
      newErrors.achievement_date = "Achievement date is required";
    }
    
    // Numeric validation
    if (achievement.total_participants && (isNaN(achievement.total_participants) || achievement.total_participants < 1)) {
      newErrors.total_participants = "Total participants must be a positive number";
    }
    
    if (achievement.team_size && (isNaN(achievement.team_size) || achievement.team_size < 1)) {
      newErrors.team_size = "Team size must be at least 1";
    }
    
    if (achievement.prize_amount && isNaN(achievement.prize_amount)) {
      newErrors.prize_amount = "Prize amount must be a valid number";
    }
    
    return newErrors;
  };

  const resetForm = () => {
    setNewAchievement({
      title: "",
      category: "academic",
      subcategory: "",
      description: "",
      achievement_date: "",
      date_of_event: "",
      level: "college",
      organization: "",
      event_name: "",
      position_rank: "",
      total_participants: "",
      team_size: 1,
      team_members: [],
      prize_amount: "",
      prize_currency: "INR",
      certificate_url: "",
      trophy_medal_received: false,
      media_coverage: false,
      media_urls: [],
      skills_demonstrated: [],
      technologies_used: [],
      tags: [],
      semester_achieved: ""
    });
    setShowAddForm(false);
    setTeamMemberInput("");
    setSkillInput("");
    setTechnologyInput("");
    setTagInput("");
    setMediaUrlInput("");
  };

  const handleAddTeamMember = () => {
    if (teamMemberInput.trim()) {
      setNewAchievement(prev => ({
        ...prev,
        team_members: [...prev.team_members, teamMemberInput.trim()]
      }));
      setTeamMemberInput("");
    }
  };

  const handleRemoveTeamMember = (index) => {
    setNewAchievement(prev => ({
      ...prev,
      team_members: prev.team_members.filter((_, i) => i !== index)
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setNewAchievement(prev => ({
        ...prev,
        skills_demonstrated: [...prev.skills_demonstrated, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (index) => {
    setNewAchievement(prev => ({
      ...prev,
      skills_demonstrated: prev.skills_demonstrated.filter((_, i) => i !== index)
    }));
  };

  const handleAddTechnology = () => {
    if (technologyInput.trim()) {
      setNewAchievement(prev => ({
        ...prev,
        technologies_used: [...prev.technologies_used, technologyInput.trim()]
      }));
      setTechnologyInput("");
    }
  };

  const handleRemoveTechnology = (index) => {
    setNewAchievement(prev => ({
      ...prev,
      technologies_used: prev.technologies_used.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setNewAchievement(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    setNewAchievement(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleAddMediaUrl = () => {
    if (mediaUrlInput.trim()) {
      setNewAchievement(prev => ({
        ...prev,
        media_urls: [...prev.media_urls, mediaUrlInput.trim()]
      }));
      setMediaUrlInput("");
    }
  };

  const handleRemoveMediaUrl = (index) => {
    setNewAchievement(prev => ({
      ...prev,
      media_urls: prev.media_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitAchievement = async () => {
    try {
      // Clear previous errors
      setErrors({});
      
      // Validate achievement data
      const validationErrors = validateAchievement(newAchievement);
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
      
      // Call the parent component's addRecord function
      await addRecord(newAchievement);
      
      // Show success message with SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Achievement record added successfully!',
        confirmButtonColor: '#28a745'
      });
      
      resetForm();
      
    } catch (error) {
      console.error('Error adding achievement record:', error);
      
      let errorMessage = "Failed to add achievement record. Please try again.";
      
      // Handle specific error types
      if (error.response?.data?.errorCode) {
        switch (error.response.data.errorCode) {
          case 'DUPLICATE_ACHIEVEMENT':
            errorMessage = "This achievement already exists. Please check your records.";
            break;
          case 'MISSING_REQUIRED_FIELDS':
            errorMessage = "Please fill in all required fields.";
            break;
          default:
            errorMessage = error.response.data.message || "Failed to add achievement record. Please try again.";
        }
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your entries and try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "You are not authorized to perform this action. Please log in again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else {
        errorMessage = "Failed to add achievement record. Please check your connection and try again.";
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

  const handleDeleteAchievement = async (achievementId) => {
    try {
      // Show confirmation dialog with SweetAlert2
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This achievement record will be permanently deleted. This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
      });

      if (!result.isConfirmed) {
        return;
      }

      setIsSubmitting(true);

      // Call the parent component's deleteRecord function
      await deleteRecord(achievementId);
      
      // Show success message with SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Achievement record deleted successfully!',
        confirmButtonColor: '#28a745'
      });
      
    } catch (error) {
      console.error('Error deleting achievement record:', error);
      
      let errorMessage = "Failed to delete achievement record. Please try again.";
      
      // Handle specific error types
      if (error.response?.data?.errorCode) {
        switch (error.response.data.errorCode) {
          case 'RECORD_NOT_FOUND':
            errorMessage = "Achievement record not found. It may have been already deleted.";
            break;
          default:
            errorMessage = error.response.data.message || "Failed to delete achievement record. Please try again.";
        }
      } else if (error.response?.status === 401) {
        errorMessage = "You are not authorized to delete this record. Please log in again.";
      } else if (error.response?.status === 404) {
        errorMessage = "Achievement record not found. It may have been already deleted.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else {
        errorMessage = "Failed to delete achievement record. Please check your connection and try again.";
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

  const handleEditRecord = (achievement) => {
    // Format the achievement data for editing, ensuring arrays are properly handled
    const formattedAchievement = {
      ...achievement,
      team_members: Array.isArray(achievement.team_members) ? achievement.team_members : 
        (achievement.team_members ? achievement.team_members.split(',').map(m => m.trim()) : []),
      skills_demonstrated: Array.isArray(achievement.skills_demonstrated) ? achievement.skills_demonstrated : 
        (achievement.skills_demonstrated ? achievement.skills_demonstrated.split(',').map(s => s.trim()) : []),
      technologies_used: Array.isArray(achievement.technologies_used) ? achievement.technologies_used : 
        (achievement.technologies_used ? achievement.technologies_used.split(',').map(t => t.trim()) : []),
      tags: Array.isArray(achievement.tags) ? achievement.tags : 
        (achievement.tags ? achievement.tags.split(',').map(tag => tag.trim()) : []),
      media_urls: Array.isArray(achievement.media_urls) ? achievement.media_urls : 
        (achievement.media_urls ? achievement.media_urls.split(',').map(url => url.trim()) : []),
      // Ensure date fields are properly formatted for input[type="date"]
      achievement_date: achievement.achievement_date ? achievement.achievement_date.split('T')[0] : '',
      date_of_event: achievement.date_of_event ? achievement.date_of_event.split('T')[0] : '',
      // Ensure numeric fields are properly handled
      team_size: achievement.team_size || 1,
      total_participants: achievement.total_participants || '',
      prize_amount: achievement.prize_amount || '',
      // Ensure boolean fields are properly handled
      trophy_medal_received: !!achievement.trophy_medal_received,
      media_coverage: !!achievement.media_coverage,
      // Ensure string fields have defaults
      prize_currency: achievement.prize_currency || 'INR',
      category: achievement.category || 'academic',
      level: achievement.level || 'college',
      semester_achieved: achievement.semester_achieved || ''
    };
    
    setEditRecord(formattedAchievement);
    setEditingId(achievement.achievement_id || achievement.id);
    setErrors({});
  };

  const handleUpdateRecord = async () => {
    try {
      // Clear previous errors
      setErrors({});
      
      // Validate achievement data
      const validationErrors = validateAchievement(editRecord);
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
      
      // Prepare the record for update
      const recordToUpdate = {
        ...editRecord,
        achievement_id: editingId
      };
      
      // Call the parent component's updateRecord function
      await updateRecord(editingId, recordToUpdate);
      
      // Show success message with SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Achievement record updated successfully!',
        confirmButtonColor: '#28a745'
      });
      
      // Reset edit states
      setEditRecord(null);
      setEditingId(null);
      
    } catch (error) {
      console.error('Error updating achievement record:', error);
      
      let errorMessage = "Failed to update achievement record. Please try again.";
      
      // Handle specific error types
      if (error.response?.data?.errorCode) {
        switch (error.response.data.errorCode) {
          case 'DUPLICATE_ACHIEVEMENT':
            errorMessage = "This achievement already exists. Please check your records.";
            break;
          case 'INVALID_DATE_RANGE':
          case 'MISSING_REQUIRED_FIELDS':
            errorMessage = "Please fill in all required fields.";
            break;
          default:
            errorMessage = error.response.data.message || "Failed to update achievement record. Please try again.";
        }
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your entries and try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "You are not authorized to perform this action. Please log in again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else {
        errorMessage = "Failed to update achievement record. Please check your connection and try again.";
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

  const handleCancelEdit = () => {
    setEditRecord(null);
    setEditingId(null);
    setErrors({});
    // Clear input states
    setTeamMemberInput('');
    setSkillInput('');
    setTechnologyInput('');
    setTagInput('');
    setMediaUrlInput('');
  };

  const categories = ["academic", "technical", "sports", "cultural", "social", "leadership", "research", "entrepreneurship"];
  const levels = ["college", "university", "state", "national", "international"];
  const currencies = ["INR", "USD", "EUR", "GBP"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const subcategoriesByCategory = {
    academic: ["scholarship", "academic_excellence", "research_paper", "thesis", "dean_list"],
    technical: ["hackathon", "ideathon", "coding_contest", "project_competition", "innovation", "patent"],
    sports: ["individual", "team", "tournament", "championship", "fitness"],
    cultural: ["music", "dance", "drama", "art", "literature", "debate"],
    social: ["volunteer", "community_service", "ngo_work", "social_impact"],
    leadership: ["student_council", "club_president", "event_management", "mentorship"],
    research: ["publication", "conference", "journal", "poster", "presentation"],
    entrepreneurship: ["startup", "business_plan", "pitch_competition", "funding"]
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'academic': return <FaCertificate className="text-blue-600" />;
      case 'technical': return <FaAward className="text-purple-600" />;
      case 'sports': return <FaTrophy className="text-yellow-600" />;
      case 'cultural': return <FaMedal className="text-pink-600" />;
      default: return <FaAward className="text-green-600" />;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'sports': return 'bg-yellow-100 text-yellow-800';
      case 'cultural': return 'bg-pink-100 text-pink-800';
      case 'social': return 'bg-green-100 text-green-800';
      case 'leadership': return 'bg-indigo-100 text-indigo-800';
      case 'research': return 'bg-red-100 text-red-800';
      case 'entrepreneurship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'international': return 'bg-red-100 text-red-800';
      case 'national': return 'bg-orange-100 text-orange-800';
      case 'state': return 'bg-yellow-100 text-yellow-800';
      case 'university': return 'bg-blue-100 text-blue-800';
      case 'college': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-100 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-600 rounded-lg shadow-md">
              <FaTrophy className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Achievement Records</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Document your accomplishments and recognition</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
          >
            <FaPlus className="text-xs" /> Add Achievement
          </button>
        </div>



      {/* Add Achievement Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-yellow-100 rounded-md">
                <FaPlus className="text-yellow-600 text-sm" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Add New Achievement</h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
          
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Title *</label>
              <input
                type="text"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.title
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="Enter achievement title"
                required
              />
              {errors.title && (
                <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                  <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" /> {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Category *</label>
              <select
                value={newAchievement.category}
                onChange={(e) => setNewAchievement(prev => ({ 
                  ...prev, 
                  category: e.target.value,
                  subcategory: "" // Reset subcategory when category changes
                }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.category ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Subcategory</label>
              <select
                value={newAchievement.subcategory}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, subcategory: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.subcategory ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <option value="">Select Subcategory</option>
                {subcategoriesByCategory[newAchievement.category]?.map(sub => (
                  <option key={sub} value={sub}>
                    {sub.replace('_', ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Level *</label>
              <select
                value={newAchievement.level}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, level: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.level ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                required
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Achievement Date *</label>
              <input
                type="date"
                value={newAchievement.achievement_date}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, achievement_date: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.achievement_date
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                required
              />
              {errors.achievement_date && (
                <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                  <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" /> {errors.achievement_date}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Semester Achieved</label>
              <select
                value={newAchievement.semester_achieved}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, semester_achieved: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.semester_achieved ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <option value="">Select Semester</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Organization *</label>
              <input
                type="text"
                value={newAchievement.organization}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, organization: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.organization
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="Organizing body/institution"
                required
              />
              {errors.organization && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <FaExclamationCircle /> {errors.organization}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Event Name</label>
              <input
                type="text"
                value={newAchievement.event_name}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, event_name: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.event_name ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="Competition/event name"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Position/Rank</label>
              <input
                type="text"
                value={newAchievement.position_rank}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, position_rank: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.position_rank ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="e.g., 1st, Winner, Gold Medal"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Total Participants</label>
              <input
                type="number"
                min="1"
                value={newAchievement.total_participants}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, total_participants: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.total_participants ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Team Size</label>
              <input
                type="number"
                min="1"
                value={newAchievement.team_size}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, team_size: parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.team_size ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="1"
              />
            </div>
          </div>

          {/* Event Date */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Event</label>
            <input
              type="date"
              value={newAchievement.date_of_event}
              onChange={(e) => setNewAchievement(prev => ({ ...prev, date_of_event: e.target.value }))}
              className="px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border-gray-200 bg-white hover:border-gray-300"
            />
          </div>

          {/* Prize Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prize Amount</label>
              <input
                type="number"
                min="0"
                value={newAchievement.prize_amount}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, prize_amount: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={newAchievement.prize_currency}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, prize_currency: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={newAchievement.description}
              onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                errors.description ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              rows="2"
              placeholder="Describe your achievement in detail..."
            />
          </div>

          {/* Certificate URL */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Certificate URL</label>
            <input
              type="url"
              value={newAchievement.certificate_url}
              onChange={(e) => setNewAchievement(prev => ({ ...prev, certificate_url: e.target.value }))}
              className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                errors.certificate_url ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              placeholder="https://example.com/certificate (drive link or direct URL)"
            />
          </div>

          {/* Dynamic Arrays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           
            {/* Team Members */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Team Members</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={teamMemberInput}
                  onChange={(e) => setTeamMemberInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTeamMember()}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Add team member name"
                />
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="px-3 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newAchievement.team_members.map((member, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {member}
                    <button
                      onClick={() => handleRemoveTeamMember(index)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills Demonstrated */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills Demonstrated</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-2 bg-green-600 text-white cursor-pointer rounded hover:bg-green-700 text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newAchievement.skills_demonstrated.map((skill, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-green-600 hover:text-green-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Technologies Used */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={technologyInput}
                  onChange={(e) => setTechnologyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTechnology()}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a technology"
                />
                <button
                  type="button"
                  onClick={handleAddTechnology}
                  className="px-3 py-2 cursor-pointer bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newAchievement.technologies_used.map((tech, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {tech}
                    <button
                      onClick={() => handleRemoveTechnology(index)}
                      className="text-purple-600 hover:text-purple-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 cursor-pointer bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newAchievement.tags.map((tag, index) => (
                  <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Media URLs</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMediaUrl()}
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                placeholder="Add media URL (news, videos, photos) - (drive link or direct URL)"
              />
              <button
                type="button"
                onClick={handleAddMediaUrl}
                className="px-3 py-2 cursor-pointer bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Add URL
              </button>
            </div>
            <div className="space-y-1">
              {newAchievement.media_urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex-1">
                    {url}
                  </a>
                  <button
                    onClick={() => handleRemoveMediaUrl(index)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-3 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newAchievement.trophy_medal_received}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, trophy_medal_received: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Trophy/Medal Received</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newAchievement.media_coverage}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, media_coverage: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Media Coverage</span>
            </label>
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={handleSubmitAchievement}
              className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all duration-200 flex items-center gap-2 ${
                isSubmitting || !newAchievement.title
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md hover:shadow-lg'
              }`}
              disabled={isSubmitting || !newAchievement.title}
            >
              {isSubmitting ? <FaSpinner className="animate-spin text-sm" /> : <FaSave className="text-sm" />}
              {isSubmitting ? 'Saving...' : 'Save Achievement'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg cursor-pointer font-medium transition-all duration-200 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300"
            >
              <FaTimes className="text-sm" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Achievements */}
      <div className="space-y-10">
        {achievements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Achievements Added</h3>
              <p className="text-gray-500 mb-4">Start documenting your accomplishments and achievements to build your portfolio.</p>
            </div>
          </div>
        ) : (
          achievements.map((achievement) => {
            const achievementId = achievement.achievement_id || achievement.id;
            const isEditing = editingId === achievementId && editRecord;
            
            return (
            <div key={achievementId} className={`border rounded-lg p-4 transition-all ${
              isEditing
                ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                : 'bg-white border-gray-200'
            }`}>
              {/* Header with Edit/Delete buttons */}
              <div className="flex flex-col lg:flex-row justify-between items-start gap-3 mb-4">
                {!isEditing ? (
                  <>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                          <p className="text-base font-medium text-yellow-600 mb-2">{achievement.organization || achievement.event_name || 'Achievement'}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(achievement.category)}`}>
                            {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(achievement.level)}`}>
                            {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
                          </span>
                          {achievement.position_rank && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                              {achievement.position_rank}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                        {achievement.achievement_date && (
                          <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                            <FaCalendarAlt className="text-gray-400" />
                            {formatDate(achievement.achievement_date)}
                          </span>
                        )}
                        {achievement.semester_achieved && (
                          <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                            <FaCertificate className="text-gray-400" />
                            Semester {achievement.semester_achieved}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditRecord(achievement)}
                        className="p-2 cursor-pointer text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                        title="Edit Record"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(achievementId)}
                        className="p-2 cursor-pointer text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded transition-colors"
                        disabled={isSubmitting}
                        title="Delete Record"
                      >
                        {isSubmitting ? <FaSpinner className="animate-spin" size={16} /> : <FaTrash size={16} />}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-xs font-semibold">
                          Editing Mode
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleUpdateRecord}
                        disabled={
                          isSubmitting ||
                          !editRecord.title ||
                          !editRecord.organization
                        }
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                          isSubmitting ||
                          !editRecord.title ||
                          !editRecord.organization
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer"
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
                {achievement.organization && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Organization</p>
                    <p className="font-semibold text-gray-900">{achievement.organization}</p>
                  </div>
                )}
                {achievement.event_name && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Event</p>
                    <p className="font-semibold text-gray-900">{achievement.event_name}</p>
                  </div>
                )}
                {achievement.total_participants && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Participants</p>
                    <p className="font-semibold text-gray-900">{achievement.total_participants}</p>
                  </div>
                )}
                {achievement.team_size > 1 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Team Size</p>
                    <p className="font-semibold text-gray-900">{achievement.team_size}</p>
                  </div>
                )}
                {achievement.prize_amount && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Prize</p>
                    <p className="font-semibold text-gray-900">{achievement.prize_amount} {achievement.prize_currency}</p>
                  </div>
                )}
              </div>

              {achievement.description && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-yellow-500 rounded"></div>
                    Description
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{achievement.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {achievement.team_members && achievement.team_members.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      Team Members
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {achievement.team_members.map((member, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {achievement.skills_demonstrated && achievement.skills_demonstrated.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      Skills Demonstrated
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {achievement.skills_demonstrated.map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {achievement.technologies_used && achievement.technologies_used.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      Technologies Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {achievement.technologies_used.map((tech, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {achievement.tags && achievement.tags.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {achievement.tags.map((tag, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(achievement.certificate_url || (achievement.media_urls && achievement.media_urls.length > 0)) && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-indigo-500 rounded"></div>
                    Links & Media
                  </h4>
                  <div className="space-y-2 space-x-3">
                    {achievement.certificate_url && (
                      <a 
                        href={achievement.certificate_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors border border-blue-200"
                      >
                        📜 View Certificate
                      </a>
                    )}
                    {achievement.media_urls && achievement.media_urls.map((url, index) => (
                      <a 
                        key={index}
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors border border-blue-200 mr-2"
                      >
                        🔗 Media Link {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {(achievement.trophy_medal_received || achievement.media_coverage) && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Recognition & Visibility</h4>
                  <div className="flex flex-wrap gap-3">
                    {achievement.trophy_medal_received && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        🏆 Trophy/Medal Received
                      </span>
                    )}
                    {achievement.media_coverage && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        📰 Media Coverage
                      </span>
                    )}
                  </div>
                </div>
              )}
                </>
              ) : (
                /* Inline Edit Form */
                <>
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="md:col-span-2 space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Title *</label>
                        <input
                          type="text"
                          value={editRecord.title}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, title: e.target.value }))}
                          className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 ${
                            errors.title ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          placeholder="Enter achievement title"
                        />
                        {errors.title && (
                          <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                            <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" /> {errors.title}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Category *</label>
                        <select
                          value={editRecord.category}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, category: e.target.value, subcategory: "" }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Subcategory</label>
                        <select
                          value={editRecord.subcategory || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, subcategory: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                        >
                          <option value="">Select Subcategory</option>
                          {subcategoriesByCategory[editRecord.category]?.map(sub => (
                            <option key={sub} value={sub}>
                              {sub.replace('_', ' ').split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Level *</label>
                        <select
                          value={editRecord.level}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                        >
                          {levels.map(level => (
                            <option key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Achievement Date *</label>
                        <input
                          type="date"
                          value={editRecord.achievement_date || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, achievement_date: e.target.value }))}
                          className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 ${
                            errors.achievement_date ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        />
                        {errors.achievement_date && (
                          <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                            <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" /> {errors.achievement_date}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Semester Achieved</label>
                        <select
                          value={editRecord.semester_achieved || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, semester_achieved: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                        >
                          <option value="">Select Semester</option>
                          {semesters.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Date of Event</label>
                        <input
                          type="date"
                          value={editRecord.date_of_event || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, date_of_event: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Organization *</label>
                        <input
                          type="text"
                          value={editRecord.organization || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, organization: e.target.value }))}
                          className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 ${
                            errors.organization ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          placeholder="Organizing body/institution"
                        />
                        {errors.organization && (
                          <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                            <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" /> {errors.organization}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Event Name</label>
                        <input
                          type="text"
                          value={editRecord.event_name || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, event_name: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                          placeholder="Competition/event name"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Position/Rank</label>
                        <input
                          type="text"
                          value={editRecord.position_rank || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, position_rank: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                          placeholder="e.g., 1st, Winner, Gold Medal"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Total Participants</label>
                        <input
                          type="number"
                          min="1"
                          value={editRecord.total_participants || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, total_participants: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Team Size</label>
                        <input
                          type="number"
                          min="1"
                          value={editRecord.team_size || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, team_size: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                          placeholder="1"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Prize Amount</label>
                        <input
                          type="number"
                          min="0"
                          value={editRecord.prize_amount || ""}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, prize_amount: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Currency</label>
                        <select
                          value={editRecord.prize_currency || "INR"}
                          onChange={(e) => setEditRecord(prev => ({ ...prev, prize_currency: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                        >
                          {currencies.map(curr => (
                            <option key={curr} value={curr}>{curr}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editRecord.description || ""}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                      rows="3"
                      placeholder="Describe your achievement in detail..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Certificate URL</label>
                    <input
                      type="url"
                      value={editRecord.certificate_url || ""}
                      onChange={(e) => setEditRecord(prev => ({ ...prev, certificate_url: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-100 focus:border-yellow-500 hover:border-gray-300"
                      placeholder="https://example.com/certificate"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Team Members */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Team Members</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={teamMemberInput}
                          onChange={(e) => setTeamMemberInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (teamMemberInput.trim()) {
                                setEditRecord(prev => ({
                                  ...prev,
                                  team_members: [...(prev.team_members || []), teamMemberInput.trim()]
                                }));
                                setTeamMemberInput('');
                              }
                            }
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="Add team member name"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (teamMemberInput.trim()) {
                              setEditRecord(prev => ({
                                ...prev,
                                team_members: [...(prev.team_members || []), teamMemberInput.trim()]
                              }));
                              setTeamMemberInput('');
                            }
                          }}
                          className="px-3 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(editRecord.team_members || []).map((member, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            {member}
                            <button
                              onClick={() => {
                                setEditRecord(prev => ({
                                  ...prev,
                                  team_members: prev.team_members.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills Demonstrated */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills Demonstrated</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (skillInput.trim()) {
                                setEditRecord(prev => ({
                                  ...prev,
                                  skills_demonstrated: [...(prev.skills_demonstrated || []), skillInput.trim()]
                                }));
                                setSkillInput('');
                              }
                            }
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="Add a skill"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (skillInput.trim()) {
                              setEditRecord(prev => ({
                                ...prev,
                                skills_demonstrated: [...(prev.skills_demonstrated || []), skillInput.trim()]
                              }));
                              setSkillInput('');
                            }
                          }}
                          className="px-3 py-2 bg-green-600 text-white cursor-pointer rounded hover:bg-green-700 text-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(editRecord.skills_demonstrated || []).map((skill, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            {skill}
                            <button
                              onClick={() => {
                                setEditRecord(prev => ({
                                  ...prev,
                                  skills_demonstrated: prev.skills_demonstrated.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-green-600 hover:text-green-800 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Technologies Used */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={technologyInput}
                          onChange={(e) => setTechnologyInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (technologyInput.trim()) {
                                setEditRecord(prev => ({
                                  ...prev,
                                  technologies_used: [...(prev.technologies_used || []), technologyInput.trim()]
                                }));
                                setTechnologyInput('');
                              }
                            }
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="Add a technology"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (technologyInput.trim()) {
                              setEditRecord(prev => ({
                                ...prev,
                                technologies_used: [...(prev.technologies_used || []), technologyInput.trim()]
                              }));
                              setTechnologyInput('');
                            }
                          }}
                          className="px-3 py-2 cursor-pointer bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(editRecord.technologies_used || []).map((tech, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            {tech}
                            <button
                              onClick={() => {
                                setEditRecord(prev => ({
                                  ...prev,
                                  technologies_used: prev.technologies_used.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-purple-600 hover:text-purple-800 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (tagInput.trim()) {
                                setEditRecord(prev => ({
                                  ...prev,
                                  tags: [...(prev.tags || []), tagInput.trim()]
                                }));
                                setTagInput('');
                              }
                            }
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="Add a tag"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tagInput.trim()) {
                              setEditRecord(prev => ({
                                ...prev,
                                tags: [...(prev.tags || []), tagInput.trim()]
                              }));
                              setTagInput('');
                            }
                          }}
                          className="px-3 py-2 cursor-pointer bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(editRecord.tags || []).map((tag, index) => (
                          <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            {tag}
                            <button
                              onClick={() => {
                                setEditRecord(prev => ({
                                  ...prev,
                                  tags: prev.tags.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Media URLs */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Media URLs</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={mediaUrlInput}
                        onChange={(e) => setMediaUrlInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (mediaUrlInput.trim()) {
                              setEditRecord(prev => ({
                                ...prev,
                                media_urls: [...(prev.media_urls || []), mediaUrlInput.trim()]
                              }));
                              setMediaUrlInput('');
                            }
                          }
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="Add media URL (news, videos, photos) - (drive link or direct URL)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (mediaUrlInput.trim()) {
                            setEditRecord(prev => ({
                              ...prev,
                              media_urls: [...(prev.media_urls || []), mediaUrlInput.trim()]
                            }));
                            setMediaUrlInput('');
                          }
                        }}
                        className="px-3 py-2 cursor-pointer bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Add URL
                      </button>
                    </div>
                    <div className="space-y-1">
                      {(editRecord.media_urls || []).map((url, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex-1">
                            {url}
                          </a>
                          <button
                            onClick={() => {
                              setEditRecord(prev => ({
                                ...prev,
                                media_urls: prev.media_urls.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editRecord.trophy_medal_received || false}
                        onChange={(e) => setEditRecord(prev => ({ ...prev, trophy_medal_received: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Trophy/Medal Received</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editRecord.media_coverage || false}
                        onChange={(e) => setEditRecord(prev => ({ ...prev, media_coverage: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Media Coverage</span>
                    </label>
                  </div>
                </>
              )}
            </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}