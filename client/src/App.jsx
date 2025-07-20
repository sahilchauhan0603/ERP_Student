// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StudentRegistration from './pages/registration/student/index';
import FacultyRegistration from './pages/registration/faculty/FacultyRegistration';
import NonTeachingStaffRegistration from './pages/registration/nonTeachingStaff/NonTeachingStaffRegistration';
import StudentLogin from './pages/auth/StudentLogin';
import AdminLogin from './pages/auth/AdminLogin';
// import StudentDashboard from './pages/studentdashboard/Dashboard';
import StudentDetailsDashboardPage  from './pages/studentdashboard/StudentDetailsDashboardPage';
import RegistrationPage from './pages/registration/registrationPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAllStudents from './pages/admin/AdminAllStudents';
import PendingStudents from './pages/admin/PendingStudents';
import ApprovedStudents from './pages/admin/ApprovedStudents';
import DeclinedStudents from './pages/admin/DeclinedStudents';

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
        <Route path="/student/:studentId" element={<StudentDetailsDashboardPage  />} />

        {/* Admin Routes - Wrapped in AdminLayout */}
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