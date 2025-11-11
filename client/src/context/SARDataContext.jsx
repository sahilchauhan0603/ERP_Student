import React, { createContext, useContext, useState, useRef } from 'react';
import axios from 'axios';

const SARDataContext = createContext();

export const SARDataProvider = ({ children }) => {
  const [sarData, setSarData] = useState({
    sarInfo: {
      enrollment_no: "",
      microsoft_email: "",
      current_semester: 1,
      profile_completion_percentage: 0
    },
    academicRecords: [],
    internships: [],
    achievements: []
  });
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false); // Track if we've already fetched SAR data

  // Lazy load SAR data - only when called
  const loadSARData = async () => {
    if (hasFetched.current) {
      return; // Already loaded
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      
      // Fetch SAR overview data
      const sarResponse = await axios.get(
        `${apiUrl}/sar/overview`,
        { withCredentials: true }
      );

      if (sarResponse.data.success) {
        const { student: studentData, sarInfo } = sarResponse.data.data;
        setStudent(studentData);
        
        // Fetch all SAR records in parallel
        const [academicRes, internshipsRes, achievementsRes] = await Promise.all([
          axios.get(`${apiUrl}/sar/academic`, { withCredentials: true }),
          axios.get(`${apiUrl}/sar/internships`, { withCredentials: true }),
          axios.get(`${apiUrl}/sar/achievements`, { withCredentials: true })
        ]);

        setSarData({
          sarInfo: {
            enrollment_no: sarInfo.enrollment_no || studentData.examRoll || "",
            microsoft_email: sarInfo.microsoft_email || "",
            current_semester: sarInfo.current_semester || 1,
            profile_completion_percentage: sarInfo.profile_completion_percentage || 0
          },
          academicRecords: academicRes.data.success ? academicRes.data.data : [],
          internships: internshipsRes.data.success ? internshipsRes.data.data : [],
          achievements: achievementsRes.data.success ? achievementsRes.data.data : []
        });

        hasFetched.current = true; // Mark as fetched
      }
    } catch (err) {
      console.error('Error fetching SAR data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Update functions for child components
  const updateSARData = (section, data) => {
    setSarData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const refreshSARSection = async (section) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9080/api';
      const response = await axios.get(`${apiUrl}/sar/${section}`, { withCredentials: true });
      
      if (response.data.success) {
        updateSARData(section, response.data.data);
      }
    } catch (err) {
      console.error(`Error refreshing SAR ${section}:`, err);
    }
  };

  // Update student data in context
  const updateStudent = (updatedInfo) => {
    setStudent(prev => ({
      ...prev,
      ...updatedInfo
    }));
  };

  const value = {
    sarData,
    student,
    loading,
    error,
    loadSARData,
    updateSARData,
    refreshSARSection,
    updateStudent
  };

  return (
    <SARDataContext.Provider value={value}>
      {children}
    </SARDataContext.Provider>
  );
};

export const useSARData = () => {
  const context = useContext(SARDataContext);
  if (context === undefined) {
    throw new Error('useSARData must be used within a SARDataProvider');
  }
  return context;
};
