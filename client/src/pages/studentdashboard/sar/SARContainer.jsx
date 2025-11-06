import React, { useEffect, useState } from "react";
import axios from "axios";
import SAROverview from "./SAROverview";
import AcademicRecords from "./AcademicRecords";
import InternshipRecords from "./InternshipRecords";
import AchievementRecords from "./AchievementRecords";
import CompleteSAR from "./CompleteSAR";

export default function SARContainer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  const sectionTabs = [
    { key: "overview", label: "SAR Overview" },
    { key: "academic", label: "Academic Records" },
    { key: "internships", label: "Internships" },
    { key: "achievements", label: "Achievements" },
    { key: "viewall", label: "Complete SAR" },
  ];

  // SAR Data State
  const [sarData, setSarData] = useState({
    sarInfo: {
      enrollment_no: "",
      microsoft_email: "",
      current_semester: 1,
      profile_completion_percentage: 0
    },
    academicRecords: [], // Array of semester records
    internships: [], // Array of internship records
    achievements: [] // Array of achievement records
  });

  useEffect(() => {
    const fetchSARData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
        
        // Fetch SAR overview data
        const sarResponse = await axios.get(
          `${apiUrl}/sar/overview`,
          { withCredentials: true }
        );

        if (sarResponse.data.success) {
          const { student, sarInfo } = sarResponse.data.data;
          setStudent(student);
          
          // Fetch all SAR records
          const [academicRes, internshipsRes, achievementsRes] = await Promise.all([
            axios.get(`${apiUrl}/sar/academic`, { withCredentials: true }),
            axios.get(`${apiUrl}/sar/internships`, { withCredentials: true }),
            axios.get(`${apiUrl}/sar/achievements`, { withCredentials: true })
          ]);

          setSarData({
            sarInfo: {
              enrollment_no: sarInfo.enrollment_no || student.examRoll || "",
              microsoft_email: sarInfo.microsoft_email || "",
              current_semester: sarInfo.current_semester || 1,
              profile_completion_percentage: sarInfo.profile_completion_percentage || 0
            },
            academicRecords: academicRes.data.success ? academicRes.data.data : [],
            internships: internshipsRes.data.success ? internshipsRes.data.data : [],
            achievements: achievementsRes.data.success ? achievementsRes.data.data : []
          });
        }
        
      } catch (error) {
        console.error("Error fetching SAR data:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError("Session expired. Please login again.");
        } else {
          setError("Failed to fetch SAR data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSARData();
  }, []);

  // Update SAR data function to pass to child components
  const updateSARData = (section, data) => {
    setSarData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Add new record functions
  const addAcademicRecord = async (record) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.post(`${apiUrl}/sar/academic`, record, { withCredentials: true });
      
      if (response.data.success) {
        // Refetch academic records to get the latest data
        const academicRes = await axios.get(`${apiUrl}/sar/academic`, { withCredentials: true });
        if (academicRes.data.success) {
          setSarData(prev => ({
            ...prev,
            academicRecords: academicRes.data.data
          }));
        }
      }
    } catch (error) {
      console.error('Error adding academic record:', error);
      alert('Failed to add academic record. Please try again.');
    }
  };

  const addInternshipRecord = async (record) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.post(`${apiUrl}/sar/internships`, record, { withCredentials: true });
      
      if (response.data.success) {
        const internshipsRes = await axios.get(`${apiUrl}/sar/internships`, { withCredentials: true });
        if (internshipsRes.data.success) {
          setSarData(prev => ({
            ...prev,
            internships: internshipsRes.data.data
          }));
        }
      }
    } catch (error) {
      console.error('Error adding internship record:', error);
      alert('Failed to add internship record. Please try again.');
    }
  };

  const addAchievementRecord = async (record) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.post(`${apiUrl}/sar/achievements`, record, { withCredentials: true });
      
      if (response.data.success) {
        const achievementsRes = await axios.get(`${apiUrl}/sar/achievements`, { withCredentials: true });
        if (achievementsRes.data.success) {
          setSarData(prev => ({
            ...prev,
            achievements: achievementsRes.data.data
          }));
        }
      }
    } catch (error) {
      console.error('Error adding achievement record:', error);
      alert('Failed to add achievement record. Please try again.');
    }
  };

  // Update record functions
  const updateAcademicRecord = async (id, updatedRecord) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/academic/${id}`, updatedRecord, { withCredentials: true });
      
      if (response.data.success) {
        const academicRes = await axios.get(`${apiUrl}/sar/academic`, { withCredentials: true });
        if (academicRes.data.success) {
          setSarData(prev => ({
            ...prev,
            academicRecords: academicRes.data.data
          }));
        }
      }
    } catch (error) {
      console.error('Error updating academic record:', error);
      alert('Failed to update academic record. Please try again.');
    }
  };

  const updateInternshipRecord = async (id, updatedRecord) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/internships/${id}`, updatedRecord, { withCredentials: true });
      
      if (response.data.success) {
        const internshipsRes = await axios.get(`${apiUrl}/sar/internships`, { withCredentials: true });
        if (internshipsRes.data.success) {
          setSarData(prev => ({
            ...prev,
            internships: internshipsRes.data.data
          }));
        }
      }
    } catch (error) {
      console.error('Error updating internship record:', error);
      alert('Failed to update internship record. Please try again.');
    }
  };

  const updateAchievementRecord = async (id, updatedRecord) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/achievements/${id}`, updatedRecord, { withCredentials: true });
      
      if (response.data.success) {
        const achievementsRes = await axios.get(`${apiUrl}/sar/achievements`, { withCredentials: true });
        if (achievementsRes.data.success) {
          setSarData(prev => ({
            ...prev,
            achievements: achievementsRes.data.data
          }));
        }
      }
    } catch (error) {
      console.error('Error updating achievement record:', error);
      alert('Failed to update achievement record. Please try again.');
    }
  };

  // Delete record functions
  const deleteAcademicRecord = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.delete(`${apiUrl}/sar/academic/${id}`, { withCredentials: true });
      
      if (response.data.success) {
        setSarData(prev => ({
          ...prev,
          academicRecords: prev.academicRecords.filter(record => record.id !== id)
        }));
      }
    } catch (error) {
      console.error('Error deleting academic record:', error);
      alert('Failed to delete academic record. Please try again.');
    }
  };

  const deleteInternshipRecord = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.delete(`${apiUrl}/sar/internships/${id}`, { withCredentials: true });
      
      if (response.data.success) {
        setSarData(prev => ({
          ...prev,
          internships: prev.internships.filter(record => record.id !== id)
        }));
      }
    } catch (error) {
      console.error('Error deleting internship record:', error);
      alert('Failed to delete internship record. Please try again.');
    }
  };

  const deleteAchievementRecord = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.delete(`${apiUrl}/sar/achievements/${id}`, { withCredentials: true });
      
      if (response.data.success) {
        setSarData(prev => ({
          ...prev,
          achievements: prev.achievements.filter(record => record.id !== id)
        }));
      }
    } catch (error) {
      console.error('Error deleting achievement record:', error);
      alert('Failed to delete achievement record. Please try again.');
    }
  };

  // Update SAR overview function
  const updateSAROverview = async (updatedInfo) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.put(`${apiUrl}/sar/overview`, updatedInfo, { withCredentials: true });
      
      if (response.data.success) {
        setSarData(prev => ({
          ...prev,
          sarInfo: {
            ...prev.sarInfo,
            ...updatedInfo
          }
        }));
      }
    } catch (error) {
      console.error('Error updating SAR overview:', error);
      alert('Failed to update SAR overview. Please try again.');
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
    <div className="pt-4 md:pt-8 pb-12 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8 border border-gray-100">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">SAR Booklet</h1>
          <p className="text-base md:text-lg text-gray-800 mb-2 md:mb-3 font-bold font-serif">
            Student Academic Record - Showcasing your academic and professional growth.
          </p>
          <p className="text-sm md:text-base text-gray-500 mb-0">
            Manage your semester-wise academic records, internships, and achievements.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 sticky top-2 z-10">
          {/* Desktop Tabs */}
          <div className="hidden md:flex justify-center">
            {sectionTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex-1 max-w-xs px-4 py-3 font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  activeSection === tab.key
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Tabs - Scrollable */}
          <div className="md:hidden">
            <div className="flex overflow-x-auto scrollbar-hide px-2 py-1 space-x-1">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                    activeSection === tab.key
                      ? "text-blue-600 bg-blue-100 border border-blue-300"
                      : "text-gray-500 bg-gray-100 hover:text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {activeSection === "overview" && (
            <SAROverview 
              student={student} 
              sarData={sarData} 
              updateSAROverview={updateSAROverview}
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