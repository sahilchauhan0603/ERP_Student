import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const StudentDataContext = createContext();

export const StudentDataProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const { isAuthenticated, userRole } = useAuth();

  // Fetch student data when authenticated as student
  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't set loading to false yet, auth might be initializing
    }
    
    if (userRole !== 'student') {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchStudentData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/student/students/me/details`,
          { 
            withCredentials: true,
            signal: abortController.signal
          }
        );
        
        setStudentData(res.data.data || null);
      } catch (err) {
        if (err.name === 'CanceledError') {
          return;
        }
        console.error('Error fetching student data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();

    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, userRole]);

  // Function to mark that changes were made (called from SAR updates)
  const markChanges = () => {
    setHasPendingChanges(true);
  };

  // Function to refresh student data from API
  const refreshStudentData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/students/me/details`,
        { withCredentials: true }
      );
      
      setStudentData(res.data.data || null);
      setHasPendingChanges(false);
      setError(null);
    } catch (err) {
      console.error('Error refreshing student data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    studentData,
    loading,
    error,
    hasPendingChanges,
    markChanges,
    refreshStudentData
  };

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
};

export const useStudentData = () => {
  const context = useContext(StudentDataContext);
  if (context === undefined) {
    throw new Error('useStudentData must be used within a StudentDataProvider');
  }
  return context;
};
