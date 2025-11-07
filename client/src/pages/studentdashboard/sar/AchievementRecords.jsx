import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaTrophy, FaMedal, FaCertificate, FaAward, FaExclamationCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function AchievementRecords({ achievements, addRecord, updateRecord, deleteRecord }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
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
    event_start_date: "",
    event_end_date: "",
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
    verification_status: "pending",
    points_awarded: 0,
    impact_score: "",
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
    
    // Date validation
    if (achievement.event_start_date && achievement.event_end_date) {
      const startDate = new Date(achievement.event_start_date);
      const endDate = new Date(achievement.event_end_date);
      
      if (endDate < startDate) {
        newErrors.event_end_date = "End date must be after start date";
      }
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
      event_start_date: "",
      event_end_date: "",
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
      verification_status: "pending",
      points_awarded: 0,
      impact_score: "",
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
          case 'INVALID_DATE_RANGE':
            errorMessage = "Invalid date range. Please check your dates.";
            setErrors({ event_end_date: "End date must be after start date" });
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
          case 'CANNOT_DELETE_VERIFIED':
            errorMessage = "Cannot delete verified achievement records. Please contact administrator.";
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

  const categories = ["academic", "technical", "sports", "cultural", "social", "leadership", "research", "entrepreneurship"];
  const levels = ["college", "university", "state", "national", "international"];
  const currencies = ["INR", "USD", "EUR", "GBP"];
  const verificationStatuses = ["pending", "verified", "rejected"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const subcategoriesByCategory = {
    academic: ["scholarship", "academic_excellence", "research_paper", "thesis", "dean_list"],
    technical: ["hackathon", "coding_contest", "project_competition", "innovation", "patent"],
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex cursor-pointer items-center gap-2">
          <FaTrophy className="text-yellow-600" />
          Achievement Records
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Add Achievement
        </button>
      </div>



      {/* Add Achievement Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Achievement</h3>
          
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 ${
                  errors.title
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter achievement title"
                required
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <FaExclamationCircle /> {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={newAchievement.category}
                onChange={(e) => setNewAchievement(prev => ({ 
                  ...prev, 
                  category: e.target.value,
                  subcategory: "" // Reset subcategory when category changes
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={newAchievement.subcategory}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, subcategory: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
              <select
                value={newAchievement.level}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, level: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Date *</label>
              <input
                type="date"
                value={newAchievement.achievement_date}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, achievement_date: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 ${
                  errors.achievement_date
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              {errors.achievement_date && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <FaExclamationCircle /> {errors.achievement_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester Achieved</label>
              <select
                value={newAchievement.semester_achieved}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, semester_achieved: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Semester</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
              <input
                type="text"
                value={newAchievement.organization}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, organization: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 ${
                  errors.organization
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input
                type="text"
                value={newAchievement.event_name}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, event_name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Competition/event name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position/Rank</label>
              <input
                type="text"
                value={newAchievement.position_rank}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, position_rank: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1st, Winner, Gold Medal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Participants</label>
              <input
                type="number"
                min="1"
                value={newAchievement.total_participants}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, total_participants: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
              <input
                type="number"
                min="1"
                value={newAchievement.team_size}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, team_size: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points Awarded</label>
              <input
                type="number"
                min="0"
                value={newAchievement.points_awarded}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, points_awarded: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Event Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Start Date</label>
              <input
                type="date"
                value={newAchievement.event_start_date}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, event_start_date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event End Date</label>
              <input
                type="date"
                value={newAchievement.event_end_date}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, event_end_date: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 ${
                  errors.event_end_date
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.event_end_date && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <FaExclamationCircle /> {errors.event_end_date}
                </p>
              )}
            </div>
          </div>

          {/* Prize Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impact Score</label>
              <input
                type="text"
                value={newAchievement.impact_score}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, impact_score: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="High/Medium/Low"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newAchievement.description}
              onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Describe your achievement in detail..."
            />
          </div>

          {/* Certificate URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
            <input
              type="url"
              value={newAchievement.certificate_url}
              onChange={(e) => setNewAchievement(prev => ({ ...prev, certificate_url: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/certificate"
            />
          </div>

          {/* Dynamic Arrays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
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
                  className="px-3 py-2 bg-blue-600 text-white cursor-pointer rounded hover:bg-blue-700 text-sm"
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
                placeholder="Add media URL (news, videos, photos)"
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
          <div className="flex gap-4 mb-6">
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

          <div className="flex gap-3">
            <button
              onClick={handleSubmitAchievement}
              className={`px-4 py-2 cursor-pointer rounded-lg transition-colors flex items-center gap-2 ${
                isSubmitting || !newAchievement.title
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={isSubmitting || !newAchievement.title}
            >
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {isSubmitting ? 'Saving...' : 'Save Achievement'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 cursor-pointer bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="inline mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Achievements */}
      <div className="space-y-4">
        {achievements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FaTrophy className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Achievements Added</h3>
            <p className="text-gray-500 mb-4">Start documenting your accomplishments and achievements.</p>
          </div>
        ) : (
          achievements.map((achievement) => (
            <div key={achievement.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  {getCategoryIcon(achievement.category)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{achievement.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                        {achievement.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(achievement.level)}`}>
                        {achievement.level}
                      </span>
                      {achievement.position_rank && (
                        <span className="px-2 py-1 bg-gold-100 text-yellow-800 rounded text-xs font-medium">
                          {achievement.position_rank}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(achievement.id)}
                    className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAchievement(achievement.id)}
                    className="text-red-600 hover:text-red-800 p-2 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                {achievement.organization && (
                  <div>
                    <span className="text-gray-500">Organization:</span> {achievement.organization}
                  </div>
                )}
                {achievement.event_name && (
                  <div>
                    <span className="text-gray-500">Event:</span> {achievement.event_name}
                  </div>
                )}
                {achievement.achievement_date && (
                  <div>
                    <span className="text-gray-500">Date:</span> {formatDate(achievement.achievement_date)}
                  </div>
                )}
                {achievement.semester_achieved && (
                  <div>
                    <span className="text-gray-500">Semester:</span> {achievement.semester_achieved}
                  </div>
                )}
                {achievement.total_participants && (
                  <div>
                    <span className="text-gray-500">Participants:</span> {achievement.total_participants}
                  </div>
                )}
                {achievement.team_size > 1 && (
                  <div>
                    <span className="text-gray-500">Team Size:</span> {achievement.team_size}
                  </div>
                )}
                {achievement.prize_amount && (
                  <div>
                    <span className="text-gray-500">Prize:</span> {achievement.prize_amount} {achievement.prize_currency}
                  </div>
                )}
                {achievement.points_awarded > 0 && (
                  <div>
                    <span className="text-gray-500">Points:</span> {achievement.points_awarded}
                  </div>
                )}
              </div>

              {achievement.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {achievement.team_members && achievement.team_members.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members</h4>
                    <div className="flex flex-wrap gap-1">
                      {achievement.team_members.map((member, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {achievement.skills_demonstrated && achievement.skills_demonstrated.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {achievement.skills_demonstrated.map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {achievement.technologies_used && achievement.technologies_used.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-1">
                      {achievement.technologies_used.map((tech, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {achievement.tags && achievement.tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {achievement.tags.map((tag, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(achievement.certificate_url || (achievement.media_urls && achievement.media_urls.length > 0)) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Links</h4>
                  <div className="space-y-1 text-sm">
                    {achievement.certificate_url && (
                      <div>
                        <a 
                          href={achievement.certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          📜 Certificate
                        </a>
                      </div>
                    )}
                    {achievement.media_urls && achievement.media_urls.map((url, index) => (
                      <div key={index}>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          🔗 Media Link {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                {achievement.trophy_medal_received && <span>🏆 Trophy/Medal Received</span>}
                {achievement.media_coverage && <span>📰 Media Coverage</span>}
                {achievement.verification_status === 'verified' && <span>✅ Verified</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}