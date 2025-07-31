import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    // Checking authentication status
    
    try {
      // Check admin authentication
      // Checking admin authentication
      const adminResponse = await axios.get(`${import.meta.env.VITE_API_URL}/admin/auth-check`, {
        withCredentials: true,
      });
      // Admin auth response received
      if (adminResponse.data.authenticated) {
        setIsAuthenticated(true);
        setUserRole('admin');
        // Admin authenticated
        return true;
      }
    } catch (adminError) {
      // Admin not authenticated
      // Admin not authenticated, try student
    }

    try {
      // Check student authentication
      // Checking student authentication
      const studentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/student/auth-check`, {
        withCredentials: true,
      });
      // Student auth response received
      if (studentResponse.data.authenticated) {
        setIsAuthenticated(true);
        setUserRole('student');
        // Student authenticated
        return true;
      }
    } catch (studentError) {
      // Student not authenticated
      // Student not authenticated
    }

    // Neither admin nor student is authenticated
    // No user authenticated
    setIsAuthenticated(false);
    setUserRole(null);
    return false;
  };

  useEffect(() => {
    // AuthProvider mounted, checking auth status
    checkAuthStatus().finally(() => {
      // Auth check completed, setting loading to false
      setLoading(false);
    });
  }, []);

  const logout = async (role) => {
    // Logging out as user
    try {
      if (role === 'admin') {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/logout`, {}, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/student/logout`, {}, {
          withCredentials: true,
        });
      }
    } catch (error) {
      // Logout error
    } finally {
      setIsAuthenticated(false);
      setUserRole(null);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/login');
      }
    }
  };

  const value = {
    isAuthenticated,
    userRole,
    loading,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 