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
    // Check if there are any cookies first to avoid unnecessary API calls
    // const hasCookies = document.cookie && document.cookie.includes('token');
    
    // if (!hasCookies) {
    //   // No authentication cookies found, user is not logged in
    //   setIsAuthenticated(false);
    //   setUserRole(null);
    //   return false;
    // }
    
    try {
      // Check admin authentication
      const adminResponse = await axios.get(`${import.meta.env.VITE_API_URL}/admin/auth-check`, {
        withCredentials: true,
      });
      
      if (adminResponse.data.authenticated) {
        setIsAuthenticated(true);
        setUserRole('admin');
        return true;
      }
    } catch (adminError) {
      // // Only log if it's not a 401 (which is expected for non-admin users)
      // if (adminError.response?.status !== 401) {
      //   console.error('Admin auth check error:', adminError);
      // }
    }

    try {
      // Check student authentication
      const studentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/student/auth-check`, {
        withCredentials: true,
      });
      
      if (studentResponse.data.authenticated) {
        setIsAuthenticated(true);
        setUserRole('student');
        return true;
      }
    } catch (studentError) {
      // // Only log if it's not a 401 (which is expected for non-student users)
      // if (studentError.response?.status !== 401) {
      //   console.error('Student auth check error:', studentError);
      // }
    }

    // Neither admin nor student is authenticated
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
        // Clear admin login time if exists
        localStorage.removeItem('adminLoginTime');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/student/logout`, {}, {
          withCredentials: true,
        });
        // Clear student login time on logout
        localStorage.removeItem('studentLoginTime');
      }
    } catch (error) {
      // Logout error
    } finally {
      // Navigate first, then update state to prevent unauthorized alert
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/login');
      }
      // Update state after navigation to prevent unauthorized alert
      setTimeout(() => {
        setIsAuthenticated(false);
        setUserRole(null);
      }, 100);
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