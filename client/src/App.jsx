// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './components/HomePage';
import StudentRegistration from './pages/registration/student/index';
import FacultyRegistration from './pages/registration/faculty/FacultyRegistration';
import NonTeachingStaffRegistration from './pages/registration/nonTeachingStaff/NonTeachingStaffRegistration';
import StudentLogin from './pages/auth/StudentLogin';
import AdminLogin from './pages/auth/AdminLogin';
import StudentDetailsDashboard from './pages/studentdashboard/Dashboard';
import Help from './pages/studentdashboard/Help';
import StudentLayout from './components/StudentLayout';
import SARBooklet from './pages/studentdashboard/SARBooklet';
import RegistrationPage from './pages/registration/registrationPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAllStudents from './pages/admin/AdminAllStudents';
import PendingStudents from './pages/admin/PendingStudents';
import ApprovedStudents from './pages/admin/ApprovedStudents';
import DeclinedStudents from './pages/admin/DeclinedStudents';
import Swal from 'sweetalert2';
import axios from 'axios';

function AuthRoute({ children, role }) {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Show SweetAlert before redirecting
      Swal.fire({
        icon: "error",
        title: "Unauthorized Access",
        text: role === 'admin' 
          ? "This page can only be accessed by authorized admins. Please log in as an admin."
          : "This page can only be accessed by authorized students. Please log in as a student.",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/login');
        }
      });
    } else if (!loading && isAuthenticated && userRole !== role) {
      // User is authenticated but with wrong role
      Swal.fire({
        icon: "error",
        title: "Unauthorized Access",
        text: role === 'admin' 
          ? "This page can only be accessed by authorized admins. Please log in as an admin."
          : "This page can only be accessed by authorized students. Please log in as a student.",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/login');
        }
      });
    }
  }, [isAuthenticated, userRole, loading, role, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== role) {
    return null;
  }

  return children;
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // Map pathname to title
    const routeTitles = {
      '/': 'Home | ERP-Student',
      '/login': 'Login | ERP-Student',
      '/admin': 'Admin Login | ERP-Student',
      '/registration': 'Registration | ERP-Student',
      '/registration/student': 'Student Registration | ERP-Student',
      '/registration/faculty': 'Faculty Registration | ERP-Student',
      '/registration/non-teaching-staff': 'Non-Teaching Staff Registration | ERP-Student',
      '/student/me': 'Student Dashboard | ERP-Student',
      '/student/sar': 'Student SAR Booklet | ERP-Student',
      '/student/help': 'Student Help | ERP-Student',
      '/admin/dashboard': 'Admin Dashboard | ERP-Student',
      '/admin/students': 'All Students | ERP-Student',
      '/admin/students/pending': 'Pending Students | ERP-Student',
      '/admin/students/approved': 'Approved Students | ERP-Student',
      '/admin/students/declined': 'Declined Students | ERP-Student',
    };
    // Default to About | ERP-Student for /about, fallback for unknown
    let title = routeTitles[location.pathname] ||
      (location.pathname.startsWith('/about') ? 'About | ERP-Student' : 'ERP-Student');
    document.title = title;
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/registration" element={<RegistrationPage />} />
      <Route path="/registration/student" element={<StudentRegistration />} />
      <Route path="/registration/faculty" element={<FacultyRegistration />} />
      <Route path="/registration/non-teaching-staff" element={<NonTeachingStaffRegistration />} />
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/admin" element={<AdminLogin />} />

      {/* Student Routes with Sidebar Layout */}
      <Route element={
        <AuthRoute role="student">
          <StudentLayout />
        </AuthRoute>
      }>
        <Route path="/student/me" element={<StudentDetailsDashboard />} />
        <Route path="/student/sar" element={<SARBooklet />} />
        <Route path="/student/help" element={<Help />} />
      </Route>

      {/* Admin Routes - Authentication handled at AdminLayout level */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminAllStudents />} />
        <Route path="/admin/students/pending" element={<PendingStudents />} />
        <Route path="/admin/students/approved" element={<ApprovedStudents />} />
        <Route path="/admin/students/declined" element={<DeclinedStudents />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<div className="p-8 text-center text-2xl font-bold">404 - Page Not Found</div>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;