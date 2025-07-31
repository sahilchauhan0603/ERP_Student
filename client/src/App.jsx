// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import StudentRegistration from './pages/registration/student/index';
import FacultyRegistration from './pages/registration/faculty/FacultyRegistration';
import NonTeachingStaffRegistration from './pages/registration/nonTeachingStaff/NonTeachingStaffRegistration';
import StudentLogin from './pages/auth/StudentLogin';
import AdminLogin from './pages/auth/AdminLogin';
import StudentDetailsDashboardPage  from './pages/studentdashboard/StudentDetailsDashboardPage';
import RegistrationPage from './pages/registration/registrationPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAllStudents from './pages/admin/AdminAllStudents';
import PendingStudents from './pages/admin/PendingStudents';
import ApprovedStudents from './pages/admin/ApprovedStudents';
import DeclinedStudents from './pages/admin/DeclinedStudents';
// import CustomModal from './components/CustomModal';
import axios from 'axios';

function AuthRoute({ children, role }) {
  const [unauthorized, setUnauthorized] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let endpoint = '';
    if (role === 'admin') endpoint = '/admin/stats';
    else endpoint = '/student/students/me/details'; // Use a valid endpoint or skip check
    axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, { withCredentials: true })
      .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setUnauthorized(true);
          setTimeout(() => {
            setRedirecting(true);
            if (role === 'admin') navigate('/admin');
            else navigate('/login');
          }, 1800);
        }
      });
  }, [role, navigate]);

  // if (unauthorized) {
  //   return <CustomModal isOpen title="Unauthorized" message="You must be logged in to access this page." type="error" duration={1800} />;
  // }
  if (redirecting) return null;
  return children;
}

export function forceLogoutStudent() {
  window.location.href = '/login';
}
export function forceLogoutAdmin() {
  window.location.href = '/admin';
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/registration/student" element={<StudentRegistration />} />
        <Route path="/registration/faculty" element={<FacultyRegistration />} />
        <Route path="/registration/non-teaching-staff" element={<NonTeachingStaffRegistration />} />
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/admin" element={<AdminLogin />} />

        {/* Student Routes */}
        <Route path="/student/me" element={
          <AuthRoute role="student">
            <StudentDetailsDashboardPage />
          </AuthRoute>
        } />

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
    </Router>
  );
}

export default App;