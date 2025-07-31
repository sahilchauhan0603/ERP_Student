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
    console.log('🔍 Checking authentication status...');
    
    try {
      // Check admin authentication
      console.log('🔍 Checking admin authentication...');
      const adminResponse = await axios.get(`${import.meta.env.VITE_API_URL}/admin/auth-check`, {
        withCredentials: true,
      });
      console.log('✅ Admin auth response:', adminResponse.data);
      if (adminResponse.data.authenticated) {
        setIsAuthenticated(true);
        setUserRole('admin');
        console.log('✅ Admin authenticated');
        return true;
      }
    } catch (adminError) {
      console.log('❌ Admin not authenticated:', adminError.response?.status);
      // Admin not authenticated, try student
    }

    try {
      // Check student authentication
      console.log('🔍 Checking student authentication...');
      const studentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/student/auth-check`, {
        withCredentials: true,
      });
      console.log('✅ Student auth response:', studentResponse.data);
      if (studentResponse.data.authenticated) {
        setIsAuthenticated(true);
        setUserRole('student');
        console.log('✅ Student authenticated');
        return true;
      }
    } catch (studentError) {
      console.log('❌ Student not authenticated:', studentError.response?.status);
      // Student not authenticated
    }

    // Neither admin nor student is authenticated
    console.log('❌ No user authenticated');
    setIsAuthenticated(false);
    setUserRole(null);
    return false;
  };

  useEffect(() => {
    console.log('🚀 AuthProvider mounted, checking auth status...');
    checkAuthStatus().finally(() => {
      console.log('✅ Auth check completed, setting loading to false');
      setLoading(false);
    });
  }, []);

  const logout = async (role) => {
    console.log('🚪 Logging out as:', role);
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
      console.error('Logout error:', error);
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