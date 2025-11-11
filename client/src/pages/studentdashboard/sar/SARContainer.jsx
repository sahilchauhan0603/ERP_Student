import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { useSARData } from "../../../context/SARDataContext";
import { useStudentData } from "../../../context/StudentDataContext";
import SAROverview from "./SAROverview";
import StudentInfo from "./StudentInfo";
import ParentsInfo from "./ParentsInfo";
import AcademicRecords from "./AcademicRecords";
import InternshipRecords from "./InternshipRecords";
import AchievementRecords from "./AchievementRecords";
import CompleteSAR from "./CompleteSAR";
import ErrorBoundary from "../../../components/ErrorBoundary";

function SARContainerContent() {
  const { sarData, student, loading, error: contextError, loadSARData, updateSARData, refreshSARSection, updateStudent: updateSARStudent } = useSARData();
  const { markChanges } = useStudentData();
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const sectionTabs = [
    { key: "overview", label: "SAR Overview" },
    { key: "studentinfo", label: "Student Info" },
    { key: "parentsinfo", label: "Parents Info" },
    { key: "academic", label: "Academic Records" },
    { key: "internships", label: "Internships" },
    { key: "achievements", label: "Achievements" },
    { key: "viewall", label: "Complete SAR" },
  ];

  // Load SAR data when component mounts
  useEffect(() => {
    loadSARData();
  }, []);

  // Set error from context if exists
  useEffect(() => {
    if (contextError) {
      setError("Failed to fetch SAR data. Please try again.");
    }
  }, [contextError]);

  /* Add new record functions */
  const addInternshipRecord = async (record) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.post(`${apiUrl}/sar/internships`, record, { withCredentials: true });
      
      if (response.data.success) {
        await refreshSARSection('internships'); // Use context refresh
      }
    } catch (error) {
      console.error('Error adding internship record:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add internship record. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
    }
  };

  const addAchievementRecord = async (record) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.post(`${apiUrl}/sar/achievements`, record, { withCredentials: true });
      
      if (response.data.success) {
        await refreshSARSection('achievements'); // Use context refresh
      }
    } catch (error) {
      console.error('Error adding achievement record:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add achievement record. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
    }
  };

  const addAcademicRecord = async (record) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.post(`${apiUrl}/sar/academic`, record, { withCredentials: true });
      
      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Academic record created successfully!',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        
        await refreshSARSection('academic'); // Use context refresh
      }
    } catch (error) {
      console.error('Error adding academic record:', error);
      
      // Handle specific error types
      const errorMessage = error.response?.data?.message || 'Failed to create academic record. Please try again.';
      const errorCode = error.response?.data?.errorCode;
      
      let alertMessage = errorMessage;
      if (errorCode === 'DUPLICATE_SEMESTER_RECORD') {
        alertMessage = 'Academic record already exists for this semester. Please edit the existing record instead.';
      } else if (errorCode === 'INVALID_SEMESTER_RANGE') {
        alertMessage = 'Please select a valid semester between 1 and 8.';
      } else if (errorCode === 'MISSING_REQUIRED_FIELDS') {
        alertMessage = 'Please fill in all required fields: semester and academic year.';
      }
      
      Swal.fire({
        title: 'Error!',
        text: alertMessage,
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
      
      // Re-throw error so component can handle it
      throw new Error(errorMessage);
    }
  };


  /* Update record functions */
  const updateAcademicRecord = async (id, updatedRecord) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/academic/${id}`, updatedRecord, { withCredentials: true });
      
      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Academic record updated successfully!',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        
        await refreshSARSection('academic'); // Use context refresh
      }
    } catch (error) {
      console.error('Error updating academic record:', error);
      
      // Handle specific error types
      const errorMessage = error.response?.data?.message || 'Failed to update academic record. Please try again.';
      const errorCode = error.response?.data?.errorCode;
      
      let alertMessage = errorMessage;
      if (errorCode === 'DUPLICATE_SEMESTER_RECORD') {
        alertMessage = 'Academic record already exists for this semester. Please use a different semester.';
      } else if (errorCode === 'RECORD_NOT_FOUND') {
        alertMessage = 'Academic record not found. It may have been deleted.';
      } else if (errorCode === 'INVALID_SEMESTER_RANGE') {
        alertMessage = 'Please select a valid semester between 1 and 8.';
      } else if (errorCode === 'MISSING_REQUIRED_FIELDS') {
        alertMessage = 'Please fill in all required fields: semester and academic year.';
      }
      
      Swal.fire({
        title: 'Error!',
        text: alertMessage,
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
      
      // Re-throw error so component can handle it
      throw new Error(errorMessage);
    }
  };

  const updateInternshipRecord = async (id, updatedRecord) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/internships/${id}`, updatedRecord, { withCredentials: true });
      
      if (response.data.success) {
        await refreshSARSection('internships');
      }
    } catch (error) {
      console.error('Error updating internship record:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update internship record. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
    }
  };

  const updateAchievementRecord = async (id, updatedRecord) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/achievements/${id}`, updatedRecord, { withCredentials: true });
      
      if (response.data.success) {
        await refreshSARSection('achievements');
      }
    } catch (error) {
      console.error('Error updating achievement record:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update achievement record. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
    }
  };


  /* Delete record functions */
  const deleteAcademicRecord = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.delete(`${apiUrl}/sar/academic/${id}`, { withCredentials: true });
      
      if (response.data.success) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Academic record deleted successfully!',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        await refreshSARSection('academic');
      }
    } catch (error) {
      console.error('Error deleting academic record:', error);
      
      // Handle specific error types
      const errorMessage = error.response?.data?.message || 'Failed to delete academic record. Please try again.';
      const errorCode = error.response?.data?.errorCode;
      
      let alertMessage = errorMessage;
      if (errorCode === 'RECORD_NOT_FOUND') {
        alertMessage = 'Academic record not found. It may have been already deleted.';
      } else if (errorCode === 'CANNOT_DELETE_VERIFIED') {
        alertMessage = 'Cannot delete verified academic records. Please contact administrator.';
      }
      
      Swal.fire({
        title: 'Error!',
        text: alertMessage,
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
      
      // Re-throw error so component can handle it
      throw new Error(errorMessage);
    }
  };

  const deleteInternshipRecord = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.delete(`${apiUrl}/sar/internships/${id}`, { withCredentials: true });
      
      if (response.data.success) {
        await refreshSARSection('internships');
      }
    } catch (error) {
      console.error('Error deleting internship record:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete internship record. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
    }
  };

  const deleteAchievementRecord = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.delete(`${apiUrl}/sar/achievements/${id}`, { withCredentials: true });
      
      if (response.data.success) {
        await refreshSARSection('achievements');
      }
    } catch (error) {
      console.error('Error deleting achievement record:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete achievement record. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
    }
  };

  // Update SAR overview function
  const updateSAROverview = async (updatedInfo) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/overview`, updatedInfo, { withCredentials: true });
      
      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'SAR overview updated successfully!',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        updateSARData('sarInfo', {
          ...sarData.sarInfo,
          ...updatedInfo
        });
      }
    } catch (error) {
      console.error('Error updating SAR overview:', error);
      
      // Handle specific error types
      const errorMessage = error.response?.data?.message || 'Failed to update SAR overview. Please try again.';
      const errorCode = error.response?.data?.errorCode;
      
      let alertMessage = errorMessage;
      if (errorCode === 'DUPLICATE_ENROLLMENT') {
        alertMessage = 'This enrollment number is already in use by another student.';
      } else if (errorCode === 'INVALID_EMAIL_FORMAT') {
        alertMessage = 'Please provide a valid email address.';
      } else if (errorCode === 'MISSING_REQUIRED_FIELDS') {
        alertMessage = 'Please fill in all required fields.';
      }
      
      Swal.fire({
        title: 'Error!',
        text: alertMessage,
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
      
      // Re-throw error so component can handle it
      throw new Error(errorMessage);
    }
  };

  // Update student info function
  const updateStudentInfo = async (updatedInfo) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/student-info`, updatedInfo, { withCredentials: true });
      
      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Student information updated successfully!',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        // Update student data in SAR context and mark changes for Dashboard
        updateSARStudent(updatedInfo);
        markChanges();
      } else {
        // If response doesn't have success: true, throw an error
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating student info:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update student information. Please try again.';
      
      throw new Error(errorMessage);
    }
  };

  // Update parents info function
  const updateParentsInfo = async (updatedInfo) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/parents-info`, updatedInfo, { withCredentials: true });
      
      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Parents information updated successfully!',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        // Update student data in SAR context and mark changes for Dashboard
        const parentData = {
          father_name: updatedInfo.fatherName,
          father_occupation: updatedInfo.fatherOccupation,
          father_email: updatedInfo.fatherEmail,
          father_mobile: updatedInfo.fatherMobile,
          father_officeAddress: updatedInfo.fatherOfficeAddress,
          mother_name: updatedInfo.motherName,
          mother_occupation: updatedInfo.motherOccupation,
          mother_email: updatedInfo.motherEmail,
          mother_mobile: updatedInfo.motherMobile,
          mother_officeAddress: updatedInfo.motherOfficeAddress,
          familyIncome: updatedInfo.familyIncome
        };
        updateSARStudent(parentData);
        markChanges();
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating parents info:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update parents information. Please try again.';
      
      throw new Error(errorMessage);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-8 bg-white rounded shadow max-w-4xl mx-auto mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
       
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6 mb-6 mt-4 sm:mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">SAR Booklet</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Student Academic Record - Showcasing your academic and professional growth</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-lg border border-gray-100 sticky top-2 z-10">
          {/* Desktop Tabs */}
          <div className="hidden md:flex">
            {sectionTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex-1 px-4 py-3 font-medium text-sm whitespace-nowrap cursor-pointer transition-colors ${
                  activeSection === tab.key
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Tabs - Scrollable */}
          <div className="md:hidden">
            <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 space-x-2">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                    activeSection === tab.key
                      ? "text-indigo-600 bg-indigo-100 border border-indigo-300 font-semibold"
                      : "text-gray-500 bg-gray-100 hover:text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section Content - No wrapper, each page handles its own background */}
        <div>
          {activeSection === "overview" && (
            <SAROverview 
              student={student} 
              sarData={sarData} 
              updateSAROverview={updateSAROverview}
            />
          )}

          {activeSection === "studentinfo" && (
            <StudentInfo 
              student={student} 
              updateStudentInfo={updateStudentInfo}
            />
          )}

          {activeSection === "parentsinfo" && (
            <ParentsInfo 
              student={student} 
              updateParentsInfo={updateParentsInfo}
            />
          )}

          {activeSection === "academic" && (
            <AcademicRecords 
              academicRecords={sarData.academicRecords}
              currentSemester={sarData.sarInfo.current_semester}
              addRecord={addAcademicRecord}
              updateRecord={updateAcademicRecord}
              deleteRecord={deleteAcademicRecord}
            />
          )}

          {activeSection === "internships" && (
            <InternshipRecords 
              internships={sarData.internships}
              addRecord={addInternshipRecord}
              updateRecord={updateInternshipRecord}
              deleteRecord={deleteInternshipRecord}
            />
          )}

          {activeSection === "achievements" && (
            <AchievementRecords 
              achievements={sarData.achievements}
              addRecord={addAchievementRecord}
              updateRecord={updateAchievementRecord}
              deleteRecord={deleteAchievementRecord}
            />
          )}

          {activeSection === "viewall" && (
            <CompleteSAR 
              student={student}
              sarData={sarData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Main container component wrapped with ErrorBoundary only
function SARContainer() {
  return (
    <ErrorBoundary>
      <SARContainerContent />
    </ErrorBoundary>
  );
}

export default SARContainer;