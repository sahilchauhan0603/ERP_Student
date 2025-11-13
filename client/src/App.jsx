// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { StudentDataProvider } from './context/StudentDataContext';
import { SARDataProvider } from './context/SARDataContext';

import HomePage from './components/HomePage';

import StudentRegistration from './pages/registration/student/index';

import StudentLogin from './pages/auth/StudentLogin';
import AdminLogin from './pages/auth/AdminLogin';

import StudentDetailsDashboard from './pages/studentdashboard/Dashboard';
import Help from './pages/studentdashboard/Help';
import StudentLayout from './components/student/StudentLayout';
import SARBooklet from './pages/studentdashboard/SARBooklet';

import RegistrationPage from './pages/registration/registrationPage';

import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAllStudents from './pages/admin/AdminAllStudents';
import PendingStudents from './pages/admin/PendingStudents';
import ApprovedStudents from './pages/admin/ApprovedStudents';
import DeclinedStudents from './pages/admin/DeclinedStudents';
import StudentSearch from './pages/admin/StudentSearch';

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
      '/admin/student-search': 'Student Search | ERP-Student',
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
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/admin" element={<AdminLogin />} />

      {/* Student Routes - Authentication handled at StudentLayout level */}
      <Route element={<StudentLayout />}>
        <Route path="/student/me" element={<StudentDetailsDashboard />} />
        <Route path="/student/sar" element={<SARBooklet />} />
        <Route path="/student/help" element={<Help />} />
      </Route>

      {/* Admin Routes - Authentication handled at AdminLayout level */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/student-search" element={<StudentSearch />} />
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
        <StudentDataProvider>
          <SARDataProvider>
            <AppContent />
          </SARDataProvider>
        </StudentDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;