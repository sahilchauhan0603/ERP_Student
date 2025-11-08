import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBook, FaChartBar, FaExclamationCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function AcademicRecords({ academicRecords, currentSemester, addRecord, updateRecord, deleteRecord }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [managingSubjectsFor, setManagingSubjectsFor] = useState(null);
  
  // Error and loading states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Academic Record Form
  const [newRecord, setNewRecord] = useState({
    semester: 1,
    academic_year: "",
    sgpa: "",
    cgpa: "",
    total_credits: "",
    earned_credits: "",
    attendance_percentage: "",
    backlog_count: 0,
    semester_result: "ongoing",
    exam_month: "",
    exam_year: "",
    remarks: "",
    subjects: []
  });

  // Subject form for adding subjects to academic record
  const [newSubject, setNewSubject] = useState({
    subject_code: "",
    subject_name: "",
    subject_type: "core",
    credits: "",
    internal_theory: "",
    external_theory: "",
    total_theory: "",
    theory_grade: "",
    theory_grade_points: "",
    internal_practical: "",
    external_practical: "",
    total_practical: "",
    practical_grade: "",
    practical_grade_points: "",
    passed: true,
    attendance: ""
  });

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectErrors, setSubjectErrors] = useState({});

  // Validation functions
  const validateRecord = (record) => {
    const newErrors = {};
    
    // Required fields
    if (!record.semester || record.semester < 1 || record.semester > 8) {
      newErrors.semester = "Semester must be between 1 and 8";
    }
    
    if (!record.academic_year.trim()) {
      newErrors.academic_year = "Academic year is required (e.g., 2024-25)";
    }
    
    // Numeric validation
    if (record.sgpa && (isNaN(record.sgpa) || record.sgpa < 0 || record.sgpa > 10)) {
      newErrors.sgpa = "SGPA must be between 0 and 10";
    }
    
    if (record.cgpa && (isNaN(record.cgpa) || record.cgpa < 0 || record.cgpa > 10)) {
      newErrors.cgpa = "CGPA must be between 0 and 10";
    }
    
    if (record.attendance_percentage && (isNaN(record.attendance_percentage) || record.attendance_percentage < 0 || record.attendance_percentage > 100)) {
      newErrors.attendance_percentage = "Attendance must be between 0 and 100";
    }
    
    if (record.total_credits && (isNaN(record.total_credits) || record.total_credits < 0)) {
      newErrors.total_credits = "Total credits must be a positive number";
    }
    
    if (record.earned_credits && (isNaN(record.earned_credits) || record.earned_credits < 0)) {
      newErrors.earned_credits = "Earned credits must be a positive number";
    }
    
    if (record.backlog_count && (isNaN(record.backlog_count) || record.backlog_count < 0)) {
      newErrors.backlog_count = "Backlog count must be a positive number";
    }
    
    // Check if semester already exists (exclude current record when editing)
    if (academicRecords.some(existing => {
      const existingId = existing.academic_id || existing.id;
      return existing.semester === parseInt(record.semester) && existingId !== editingId;
    })) {
      newErrors.semester = "Academic record for this semester already exists";
    }
    
    return newErrors;
  };

  const validateSubject = (subject) => {
    const newErrors = {};
    
    if (!subject.subject_code.trim()) {
      newErrors.subject_code = "Subject code is required";
    }
    
    if (!subject.subject_name.trim()) {
      newErrors.subject_name = "Subject name is required";
    }
    
    if (subject.credits && (isNaN(subject.credits) || subject.credits < 0)) {
      newErrors.credits = "Credits must be a positive number";
    }
    
    // Marks validation for new structure
    const markFields = ['internal_theory', 'external_theory', 'internal_practical', 'external_practical'];
    markFields.forEach(field => {
      if (subject[field] && (isNaN(subject[field]) || subject[field] < 0)) {
        newErrors[field] = "Marks must be a positive number";
      }
    });
    
    // Validate theory marks consistency
    if (subject.internal_theory && subject.external_theory) {
      const internalTheory = parseFloat(subject.internal_theory) || 0;
      const externalTheory = parseFloat(subject.external_theory) || 0;
      const totalTheory = parseFloat(subject.total_theory) || 0;
      
      if (totalTheory > 0 && Math.abs((internalTheory + externalTheory) - totalTheory) > 0.01) {
        newErrors.total_theory = "Total theory marks should equal internal + external theory marks";
      }
    }
    
    // Validate practical marks consistency
    if (subject.internal_practical && subject.external_practical) {
      const internalPractical = parseFloat(subject.internal_practical) || 0;
      const externalPractical = parseFloat(subject.external_practical) || 0;
      const totalPractical = parseFloat(subject.total_practical) || 0;
      
      if (totalPractical > 0 && Math.abs((internalPractical + externalPractical) - totalPractical) > 0.01) {
        newErrors.total_practical = "Total practical marks should equal internal + external practical marks";
      }
    }
    
    return newErrors;
  };

  // Auto-calculate total theory marks
  const calculateTotalTheory = (internal, external) => {
    const internalVal = parseFloat(internal) || 0;
    const externalVal = parseFloat(external) || 0;
    return internalVal + externalVal;
  };
  // Auto-calculate total practical marks
  const calculateTotalPractical = (internal, external) => {
    const internalVal = parseFloat(internal) || 0;
    const externalVal = parseFloat(external) || 0;
    return internalVal + externalVal;
  };

  // Handle subject field changes with auto-calculation
  const handleSubjectFieldChange = (field, value) => {
    setNewSubject(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total theory when internal or external theory changes
      if (field === 'internal_theory' || field === 'external_theory') {
        updated.total_theory = calculateTotalTheory(
          field === 'internal_theory' ? value : updated.internal_theory,
          field === 'external_theory' ? value : updated.external_theory
        ).toString();
      }
      
      // Auto-calculate total practical when internal or external practical changes
      if (field === 'internal_practical' || field === 'external_practical') {
        updated.total_practical = calculateTotalPractical(
          field === 'internal_practical' ? value : updated.internal_practical,
          field === 'external_practical' ? value : updated.external_practical
        ).toString();
      }
      
      return updated;
    });
  };

  const resetNewRecord = () => {
    setNewRecord({
      semester: 1,
      academic_year: "",
      sgpa: "",
      cgpa: "",
      total_credits: "",
      earned_credits: "",
      attendance_percentage: "",
      backlog_count: 0,
      semester_result: "ongoing",
      exam_month: "",
      exam_year: "",
      remarks: "",
      subjects: []
    });
    setShowAddForm(false);
    setShowSubjectForm(false);
    setErrors({});
  };

  const handleAddSubject = () => {
    const subjectValidationErrors = validateSubject(newSubject);
    
    if (Object.keys(subjectValidationErrors).length > 0) {
      setSubjectErrors(subjectValidationErrors);
      setErrors({ subject: subjectValidationErrors });
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fix the errors in subject details.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setNewRecord(prev => ({
      ...prev,
      subjects: [...prev.subjects, { ...newSubject, id: Date.now() }]
    }));
    setNewSubject({
      subject_code: "",
      subject_name: "",
      subject_type: "core",
      credits: "",
      internal_theory: "",
      external_theory: "",
      total_theory: "",
      theory_grade: "",
      theory_grade_points: "",
      internal_practical: "",
      external_practical: "",
      total_practical: "",
      practical_grade: "",
      practical_grade_points: "",
      passed: true,
      attendance: ""
    });
    setShowSubjectForm(false);
    setErrors({});
    setSubjectErrors({});
    
    // Show success toast
    Swal.fire({
      title: 'Success!',
      text: 'Subject added successfully!',
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const handleSubmitRecord = async () => {
    const recordErrors = validateRecord(newRecord);
    
    if (Object.keys(recordErrors).length > 0) {
      setErrors({ record: recordErrors });
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fix the highlighted errors before submitting.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addRecord(newRecord);
      await Swal.fire({
        title: 'Success!',
        text: 'Academic record created successfully!',
        icon: 'success',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Great!'
      });
      resetNewRecord();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || "Failed to create academic record. Please try again.",
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
      console.error("Error creating academic record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    const result = await Swal.fire({
      title: 'Remove Subject?',
      text: "This will remove the subject from the record.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }
    
    setNewRecord(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject.id !== subjectId)
    }));
    
    // Show success toast
    Swal.fire({
      title: 'Removed!',
      text: 'Subject removed successfully!',
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const handleDeleteRecord = async (recordId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this academic record!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }
    
    try {
      await deleteRecord(recordId);
      Swal.fire({
        title: 'Deleted!',
        text: 'Academic record has been deleted successfully.',
        icon: 'success',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || "Failed to delete academic record. Please try again.",
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
      console.error("Error deleting academic record:", error);
    }
  };

  const handleAddSubjectToRecord = async (recordId, subject) => {
    try {
      // Validate the subject first
      const subjectErrors = validateSubject(subject);
      
      if (Object.keys(subjectErrors).length > 0) {
        setErrors({ subject: subjectErrors });
        Swal.fire({
          title: 'Validation Error',
          text: 'Please fix the errors in subject details before adding.',
          icon: 'error',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      setIsSubmitting(true);
      
      // Find the existing record
      const existingRecord = academicRecords.find(record => 
        (record.academic_id || record.id) === recordId
      );
      
      if (!existingRecord) {
        throw new Error("Academic record not found");
      }
      
      // Create updated record with new subject
      const updatedRecord = {
        ...existingRecord,
        subjects: [...(existingRecord.subjects || []), { ...subject, id: Date.now() }]
      };
      
      // Ensure subjects is always an array before sending to backend
      if (!Array.isArray(updatedRecord.subjects)) {
        updatedRecord.subjects = [];
      }
      
      // Call the parent component's updateRecord function
      await updateRecord(recordId, updatedRecord);
      
      // Reset the subject form
      setNewSubject({
        subject_code: "",
        subject_name: "",
        subject_type: "core",
        credits: "",
        internal_theory: "",
        external_theory: "",
        total_theory: "",
        theory_grade: "",
        theory_grade_points: "",
        internal_practical: "",
        external_practical: "",
        total_practical: "",
        practical_grade: "",
        practical_grade_points: "",
        passed: true,
        attendance: ""
      });
      
      // Clear any errors
      setErrors({});
      
      // Show success message with SweetAlert2
      await Swal.fire({
        title: 'Success!',
        text: 'Subject added successfully to the academic record!',
        icon: 'success',
        confirmButtonColor: '#28a745'
      });
      
      setManagingSubjectsFor(null);
    } catch (error) {
      console.error("Error adding subject to record:", error);
      
      // Show error message with SweetAlert2
      Swal.fire({
        title: 'Error!',
        text: error.message || "Failed to add subject to record. Please try again.",
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecord = (record) => {
    // Use academic_id as the primary ID (since that's what delete uses)
    const recordId = record.academic_id || record.id;
    setEditingId(recordId);
    setEditRecord({
      ...record,
      id: recordId, // Ensure we have the correct ID for API calls
      subjects: record.subjects || []
    });
    setErrors({});
  };

  const handleUpdateRecord = async () => {
    const recordErrors = validateRecord(editRecord);
    
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
      await updateRecord(editRecord.id, editRecord);
      await Swal.fire({
        title: 'Updated!',
        text: 'Academic record updated successfully!',
        icon: 'success',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Great!'
      });
      setEditingId(null);
      setEditRecord(null);
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || "Failed to update academic record. Please try again.",
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
      console.error("Error updating academic record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRecord(null);
    setErrors({});
  };

  const subjectTypes = ["core", "elective", "lab", "project", "seminar", "internship"];
  const semesterResults = ["ongoing", "pass", "fail", "detained"];
  const grades = ["O", "A+", "A", "B+", "B", "C+", "C", "D", "F"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
              <FaBook className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Academic Records</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Track your semester-wise academic performance</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-xl font-medium text-sm w-full sm:w-auto justify-center"
            // className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <FaPlus className="text-sm" /> Add Semester Record
          </button>
        </div>



      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded-md">
                <FaPlus className="text-blue-600 text-sm" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Add New Academic Record</h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Semester *</label>
              <select
                value={newRecord.semester}
                onChange={(e) => setNewRecord(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.semester ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                required
              >
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              {errors.record?.semester && (
                <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                  <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                  {errors.record.semester}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Academic Year *</label>
              <input
                type="text"
                value={newRecord.academic_year}
                onChange={(e) => setNewRecord(prev => ({ ...prev, academic_year: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.academic_year ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="e.g., 2023-24"
                required
              />
              {errors.record?.academic_year && (
                <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                  <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                  {errors.record.academic_year}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">SGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={newRecord.sgpa}
                onChange={(e) => setNewRecord(prev => ({ ...prev, sgpa: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.sgpa ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.record?.sgpa && (
                <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-1 rounded">
                  <FaExclamationCircle className="text-red-500 flex-shrink-0 text-xs" />
                  {errors.record.sgpa}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={newRecord.cgpa}
                onChange={(e) => setNewRecord(prev => ({ ...prev, cgpa: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.cgpa ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Total Credits</label>
              <input
                type="number"
                min="0"
                value={newRecord.total_credits}
                onChange={(e) => setNewRecord(prev => ({ ...prev, total_credits: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.total_credits ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Earned Credits</label>
              <input
                type="number"
                min="0"
                value={newRecord.earned_credits}
                onChange={(e) => setNewRecord(prev => ({ ...prev, earned_credits: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.earned_credits ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Attendance %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newRecord.attendance_percentage}
                onChange={(e) => setNewRecord(prev => ({ ...prev, attendance_percentage: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.attendance_percentage ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Backlog Count</label>
              <input
                type="number"
                min="0"
                value={newRecord.backlog_count}
                onChange={(e) => setNewRecord(prev => ({ ...prev, backlog_count: parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.backlog_count ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Semester Result</label>
              <select
                value={newRecord.semester_result}
                onChange={(e) => setNewRecord(prev => ({ ...prev, semester_result: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.semester_result ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {semesterResults.map(result => (
                  <option key={result} value={result}>
                    {result === 'pass' ? 'Passed' : 
                     result === 'fail' ? 'Failed' :
                     result === 'detained' ? 'Detained' :
                     result.charAt(0).toUpperCase() + result.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Exam Month</label>
              <input
                type="text"
                value={newRecord.exam_month}
                onChange={(e) => setNewRecord(prev => ({ ...prev, exam_month: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.exam_month ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="e.g., May"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Exam Year</label>
              <input
                type="text"
                value={newRecord.exam_year}
                onChange={(e) => setNewRecord(prev => ({ ...prev, exam_year: e.target.value }))}
                className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.record?.exam_year ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="e.g., 2024"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
            <textarea
              value={newRecord.remarks}
              onChange={(e) => setNewRecord(prev => ({ ...prev, remarks: e.target.value }))}
              className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                errors.record?.remarks ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              rows="2"
              placeholder="Any additional remarks about this semester..."
            />
          </div>

          {/* Subjects Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                <FaBook className="text-green-600" />
                Subjects ({newRecord.subjects.length})
              </h4>
              <button
                onClick={() => setShowSubjectForm(true)}
                className="flex items-center gap-2 cursor-pointer px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
              >
                <FaPlus className="text-xs" /> Add Subject
              </button>
            </div>
            
            {newRecord.subjects.length === 0 && !showSubjectForm && (
              <div className="text-center py-6 bg-green-50 rounded-lg border-2 border-dashed border-green-300">
                <FaBook className="mx-auto text-2xl text-green-400 mb-2" />
                <p className="text-green-700 text-sm font-medium">No subjects added yet</p>
                <p className="text-green-600 text-xs">Click "Add Subject" to add subjects for this semester</p>
              </div>
            )}

            {/* Subject Form */}
            {showSubjectForm && (
              <div className="bg-white border rounded-lg p-4 mb-4">
                <h5 className="text-sm font-medium text-gray-800 mb-3">Add Subject</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Subject Code *"
                    value={newSubject.subject_code}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subject_code: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject Name *"
                    value={newSubject.subject_name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subject_name: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={newSubject.subject_type}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subject_type: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  >
                    {subjectTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Credits"
                    min="0"
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, credits: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                    value={newSubject.grade}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, grade: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Grade Points"
                    min="0"
                    max="10"
                    step="0.1"
                    value={newSubject.grade_points}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, grade_points: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Attendance %"
                    min="0"
                    max="100"
                    value={newSubject.attendance}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, attendance: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSubject}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors font-medium shadow-sm"
                    disabled={!newSubject.subject_code || !newSubject.subject_name}
                  >
                    Add Subject
                  </button>
                  <button
                    onClick={() => setShowSubjectForm(false)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors font-medium border-2 border-gray-200 hover:border-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Added Subjects List */}
            {newRecord.subjects.length > 0 && (
              <div className="space-y-2">
                {newRecord.subjects.map((subject) => (
                  <div key={subject.id} className="bg-white border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-sm">{subject.subject_code} - {subject.subject_name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({subject.subject_type} • {subject.credits} credits • Grade: {subject.grade || 'N/A'})
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={handleSubmitRecord}
              disabled={isSubmitting || !newRecord.semester || !newRecord.academic_year}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
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
                  Save Academic Record
                </>
              )}
            </button>
            <button
              onClick={resetNewRecord}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <FaTimes className="text-sm" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subject Management Modal */}
      {managingSubjectsFor && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Manage Subjects - Semester {managingSubjectsFor.semester} ({managingSubjectsFor.academic_year})
              </h3>
              <button
                onClick={() => setManagingSubjectsFor(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Current Subjects */}
            {managingSubjectsFor.subjects && managingSubjectsFor.subjects.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Current Subjects ({managingSubjectsFor.subjects.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {managingSubjectsFor.subjects.map((subject, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{subject.subject_code} - {subject.subject_name}</div>
                          <div className="text-gray-600 text-xs mt-1">
                            <span className="inline-block mr-3">{subject.subject_type}</span>
                            <span className="inline-block mr-3">{subject.credits} credits</span>
                            {/* Show theory and practical grades separately */}
                            {subject.theory_grade && (
                              <span className="inline-block mr-3">Theory: {subject.theory_grade}</span>
                            )}
                            {subject.practical_grade && (
                              <span className="inline-block mr-3">Practical: {subject.practical_grade}</span>
                            )}
                            {/* Fallback for old grade format */}
                            {!subject.theory_grade && !subject.practical_grade && subject.grade && (
                              <span className="inline-block">Grade: {subject.grade}</span>
                            )}
                            {!subject.theory_grade && !subject.practical_grade && !subject.grade && (
                              <span className="inline-block">Grade: N/A</span>
                            )}
                          </div>
                          {(subject.internal_theory || subject.external_theory || subject.internal_practical || subject.external_practical) && (
                            <div className="text-gray-600 text-xs mt-2 space-y-1">
                              {/* Theory breakdown */}
                              {(subject.internal_theory || subject.external_theory) && (
                                <div>
                                  <span className="font-medium">Theory:</span> 
                                  {subject.internal_theory && <span> Int: {subject.internal_theory}</span>}
                                  {subject.external_theory && <span> | Ext: {subject.external_theory}</span>}
                                  {subject.total_theory && <span> | Total: {subject.total_theory}</span>}
                                  {subject.theory_grade && <span> | Grade: {subject.theory_grade}</span>}
                                  {subject.theory_grade_points && <span> ({subject.theory_grade_points} pts)</span>}
                                </div>
                              )}
                              {/* Practical breakdown */}
                              {(subject.internal_practical || subject.external_practical) && (
                                <div>
                                  <span className="font-medium">Practical:</span>
                                  {subject.internal_practical && <span> Int: {subject.internal_practical}</span>}
                                  {subject.external_practical && <span> | Ext: {subject.external_practical}</span>}
                                  {subject.total_practical && <span> | Total: {subject.total_practical}</span>}
                                  {subject.practical_grade && <span> | Grade: {subject.practical_grade}</span>}
                                  {subject.practical_grade_points && <span> ({subject.practical_grade_points} pts)</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {/* Handle edit subject */}}
                          className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer ml-2"
                          title="Edit Subject"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Subject Form */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">Add New Subject</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    value={newSubject.subject_code}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subject_code: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.subject?.subject_code ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., CS101"
                    required
                  />
                  {errors.subject?.subject_code && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.subject.subject_code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    value={newSubject.subject_name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subject_name: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.subject?.subject_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Programming Fundamentals"
                    required
                  />
                  {errors.subject?.subject_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.subject.subject_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Type</label>
                  <select
                    value={newSubject.subject_type}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subject_type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {subjectTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, credits: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="3"
                  />
                </div>

                {/* Theory Marks Section */}
                <div className="col-span-full">
                  <h4 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Theory Marks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Internal Theory</label>
                      <input
                        type="number"
                        min="0"
                        value={newSubject.internal_theory}
                        onChange={(e) => handleSubjectFieldChange('internal_theory', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          subjectErrors.internal_theory ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="30"
                      />
                      {subjectErrors.internal_theory && (
                        <p className="text-red-500 text-sm mt-1">{subjectErrors.internal_theory}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">External Theory</label>
                      <input
                        type="number"
                        min="0"
                        value={newSubject.external_theory}
                        onChange={(e) => handleSubjectFieldChange('external_theory', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          subjectErrors.external_theory ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="70"
                      />
                      {subjectErrors.external_theory && (
                        <p className="text-red-500 text-sm mt-1">{subjectErrors.external_theory}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Theory (Auto)</label>
                      <input
                        type="number"
                        min="0"
                        value={newSubject.total_theory}
                        readOnly
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                        placeholder="100"
                      />
                      {subjectErrors.total_theory && (
                        <p className="text-red-500 text-sm mt-1">{subjectErrors.total_theory}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Practical Marks Section */}
                <div className="col-span-full">
                  <h4 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Practical Marks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Internal Practical</label>
                      <input
                        type="number"
                        min="0"
                        value={newSubject.internal_practical}
                        onChange={(e) => handleSubjectFieldChange('internal_practical', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          subjectErrors.internal_practical ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="25"
                      />
                      {subjectErrors.internal_practical && (
                        <p className="text-red-500 text-sm mt-1">{subjectErrors.internal_practical}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">External Practical</label>
                      <input
                        type="number"
                        min="0"
                        value={newSubject.external_practical}
                        onChange={(e) => handleSubjectFieldChange('external_practical', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          subjectErrors.external_practical ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="25"
                      />
                      {subjectErrors.external_practical && (
                        <p className="text-red-500 text-sm mt-1">{subjectErrors.external_practical}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Practical (Auto)</label>
                      <input
                        type="number"
                        min="0"
                        value={newSubject.total_practical}
                        readOnly
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                        placeholder="50"
                      />
                      {subjectErrors.total_practical && (
                        <p className="text-red-500 text-sm mt-1">{subjectErrors.total_practical}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Theory Grade Section */}
                <div className="col-span-full">
                  <h4 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Theory Grade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Theory Grade</label>
                      <select
                        value={newSubject.theory_grade}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, theory_grade: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Theory Grade</option>
                        {grades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Theory Grade Points</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={newSubject.theory_grade_points}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, theory_grade_points: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="8.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Practical Grade Section */}
                <div className="col-span-full">
                  <h4 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Practical Grade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Practical Grade</label>
                      <select
                        value={newSubject.practical_grade}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, practical_grade: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Practical Grade</option>
                        {grades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Practical Grade Points</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={newSubject.practical_grade_points}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, practical_grade_points: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="9.0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendance %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newSubject.attendance}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, attendance: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="90"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAddSubjectToRecord(managingSubjectsFor.academic_id || managingSubjectsFor.id, newSubject)}
                  disabled={isSubmitting || !newSubject.subject_code || !newSubject.subject_name}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isSubmitting || !newSubject.subject_code || !newSubject.subject_name
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Subject
                    </>
                  )}
                </button>
                <button
                  onClick={() => setManagingSubjectsFor(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Form */}
      {editingId && editRecord && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-amber-800">
              Edit Academic Record - Semester {editRecord.semester}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                value={editRecord.semester}
                onChange={(e) => setEditRecord(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.record?.semester ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              >
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              {errors.record?.semester && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  {errors.record.semester}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <input
                type="text"
                value={editRecord.academic_year}
                onChange={(e) => setEditRecord(prev => ({ ...prev, academic_year: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.record?.academic_year ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., 2023-24"
                required
              />
              {errors.record?.academic_year && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  {errors.record.academic_year}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={editRecord.sgpa}
                onChange={(e) => setEditRecord(prev => ({ ...prev, sgpa: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.record?.sgpa ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.record?.sgpa && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  {errors.record.sgpa}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={editRecord.cgpa}
                onChange={(e) => setEditRecord(prev => ({ ...prev, cgpa: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Credits</label>
              <input
                type="number"
                min="0"
                value={editRecord.total_credits}
                onChange={(e) => setEditRecord(prev => ({ ...prev, total_credits: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Earned Credits</label>
              <input
                type="number"
                min="0"
                value={editRecord.earned_credits}
                onChange={(e) => setEditRecord(prev => ({ ...prev, earned_credits: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendance %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={editRecord.attendance_percentage}
                onChange={(e) => setEditRecord(prev => ({ ...prev, attendance_percentage: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backlog Count</label>
              <input
                type="number"
                min="0"
                value={editRecord.backlog_count}
                onChange={(e) => setEditRecord(prev => ({ ...prev, backlog_count: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester Result</label>
              <select
                value={editRecord.semester_result}
                onChange={(e) => setEditRecord(prev => ({ ...prev, semester_result: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {["ongoing", "pass", "fail", "detained"].map(result => (
                  <option key={result} value={result}>
                    {result === 'pass' ? 'Passed' : 
                     result === 'fail' ? 'Failed' :
                     result === 'detained' ? 'Detained' :
                     result.charAt(0).toUpperCase() + result.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Month</label>
              <input
                type="text"
                value={editRecord.exam_month}
                onChange={(e) => setEditRecord(prev => ({ ...prev, exam_month: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., May"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Year</label>
              <input
                type="text"
                value={editRecord.exam_year}
                onChange={(e) => setEditRecord(prev => ({ ...prev, exam_year: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={editRecord.remarks}
              onChange={(e) => setEditRecord(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Any additional remarks about this semester..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpdateRecord}
              disabled={isSubmitting || !editRecord.semester || !editRecord.academic_year}
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

      {/* Existing Records */}
      <div className="space-y-4">
        {academicRecords.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FaChartBar className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Academic Records Added</h3>
            <p className="text-gray-500 mb-4">Start by adding your semester-wise academic performance records.</p>
          </div>
        ) : (
          academicRecords.map((record) => {
            const recordId = record.academic_id || record.id;
            return (
            <div key={recordId} className={`rounded-lg p-6 shadow-sm ${
              editingId === recordId 
                ? 'bg-amber-50 border-2 border-amber-300' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Semester {record.semester} • {record.academic_year}
                    </h3>
                    {editingId === recordId && (
                      <span className="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full font-medium">
                        Currently Editing
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    {record.sgpa && <span>SGPA: <strong>{record.sgpa}</strong></span>}
                    {record.cgpa && <span>CGPA: <strong>{record.cgpa}</strong></span>}
                    {record.attendance_percentage && <span>Attendance: <strong>{record.attendance_percentage}%</strong></span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editingId === recordId ? handleCancelEdit() : handleEditRecord(record)}
                    className={`p-2 cursor-pointer rounded transition-colors ${
                      editingId === recordId 
                        ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-100' 
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                    title={editingId === recordId ? "Cancel Edit" : "Edit Record"}
                  >
                    {editingId === recordId ? <FaTimes /> : <FaEdit />}
                  </button>
                  <button
                    onClick={() => setManagingSubjectsFor(record)}
                    className="text-green-600 hover:text-green-800 p-2 cursor-pointer hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                    title="Add/Manage Subjects for this semester"
                  >
                    <FaPlus />
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record.academic_id)}
                    className="text-red-600 hover:text-red-800 p-2 cursor-pointer hover:bg-red-50 rounded transition-colors"
                    title="Delete Record"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-sm">
                  <span className="text-gray-500">Credits:</span> {record.earned_credits}/{record.total_credits}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Backlogs:</span> {record.backlog_count}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Result:</span> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    record.semester_result === 'pass' ? 'bg-green-100 text-green-800' :
                    record.semester_result === 'fail' ? 'bg-red-100 text-red-800' :
                    record.semester_result === 'detained' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.semester_result === 'pass' ? 'Passed' : 
                     record.semester_result === 'fail' ? 'Failed' :
                     record.semester_result === 'detained' ? 'Detained' :
                     record.semester_result.charAt(0).toUpperCase() + record.semester_result.slice(1)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Subjects:</span> {(() => {
                    let subjects = record.subjects || record.Subjects || record.academic_subjects || [];
                    
                    // If subjects is a string (JSON), parse it
                    if (typeof subjects === 'string') {
                      try {
                        subjects = JSON.parse(subjects);
                      } catch (e) {
                        subjects = [];
                      }
                    }
                    
                    return Array.isArray(subjects) ? subjects.length : 0;
                  })()}
                </div>
              </div>

              {/* Subjects Section */}
              {(() => {
                // Handle different possible subject data structures and parse JSON strings
                let subjects = record.subjects || record.Subjects || record.academic_subjects || [];
                
                // If subjects is a string (JSON), parse it
                if (typeof subjects === 'string') {
                  try {
                    subjects = JSON.parse(subjects);
                  } catch (e) {
                    subjects = [];
                  }
                }
                
                // Ensure subjects is an array
                if (!Array.isArray(subjects)) {
                  subjects = [];
                }
                
                const subjectCount = subjects.length;
                
                return subjectCount > 0 ? (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Subjects ({subjectCount})</h4>
                      <button
                        onClick={() => setManagingSubjectsFor(record)}
                        className="text-xs text-green-600 hover:text-green-800 cursor-pointer flex items-center gap-1"
                      >
                        <FaPlus className="text-xs" /> Add More
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subjects.map((subject, index) => (
                        <div key={subject.id || index} className="bg-gray-50 rounded p-3 text-sm border border-gray-200">
                          <div className="font-medium text-gray-800">
                            {subject.subject_code || subject.code || 'N/A'} - {subject.subject_name || subject.name || 'Unnamed Subject'}
                          </div>
                          <div className="text-gray-600 text-xs mt-1 flex flex-wrap gap-2">
                            <span>{subject.credits || subject.credit || 0} credits</span>
                            <span>•</span>
                            {/* Show theory and practical grades separately */}
                            {subject.theory_grade && (
                              <span>Theory: {subject.theory_grade}</span>
                            )}
                            {subject.theory_grade && subject.practical_grade && <span>•</span>}
                            {subject.practical_grade && (
                              <span>Practical: {subject.practical_grade}</span>
                            )}
                            {/* Fallback for old grade format */}
                            {!subject.theory_grade && !subject.practical_grade && (
                              <span>Grade: {subject.grade || subject.final_grade || 'N/A'}</span>
                            )}
                          </div>
                          
                          {/* Detailed marks breakdown */}
                          {(subject.internal_theory || subject.external_theory || subject.internal_practical || subject.external_practical) && (
                            <div className="text-gray-600 text-xs mt-2 space-y-1">
                              {/* Theory breakdown */}
                              {(subject.internal_theory || subject.external_theory) && (
                                <div>
                                  <span className="font-medium text-blue-600">Theory:</span> 
                                  {subject.internal_theory && <span> Int: {subject.internal_theory}</span>}
                                  {subject.external_theory && <span> | Ext: {subject.external_theory}</span>}
                                  {subject.total_theory && <span> | Total: {subject.total_theory}</span>}
                                  {subject.theory_grade && <span> | Grade: {subject.theory_grade}</span>}
                                  {subject.theory_grade_points && <span> ({subject.theory_grade_points} pts)</span>}
                                </div>
                              )}
                              {/* Practical breakdown */}
                              {(subject.internal_practical || subject.external_practical) && (
                                <div>
                                  <span className="font-medium text-green-600">Practical:</span>
                                  {subject.internal_practical && <span> Int: {subject.internal_practical}</span>}
                                  {subject.external_practical && <span> | Ext: {subject.external_practical}</span>}
                                  {subject.total_practical && <span> | Total: {subject.total_practical}</span>}
                                  {subject.practical_grade && <span> | Grade: {subject.practical_grade}</span>}
                                  {subject.practical_grade_points && <span> ({subject.practical_grade_points} pts)</span>}
                                </div>
                              )}
                            </div>
                          )}
                          {subject.subject_type && (
                            <div className="text-xs text-blue-600 mt-1 capitalize">
                              {subject.subject_type}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <div className="text-center py-4 bg-blue-50 rounded-lg border border-blue-200">
                      <FaBook className="mx-auto text-xl text-blue-400 mb-2" />
                      <p className="text-blue-700 text-sm font-medium mb-2">No subjects added yet</p>
                      <button
                        onClick={() => setManagingSubjectsFor(record)}
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <FaPlus className="inline text-xs mr-1" /> Add Subjects
                      </button>
                    </div>
                  </div>
                );
              })()}

              {record.remarks && record.remarks.trim() && record.remarks !== 'topper' && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600">{record.remarks}</p>
                </div>
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