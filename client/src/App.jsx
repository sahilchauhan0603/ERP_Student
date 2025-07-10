import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RegistrationPage from './components/registration/registrationPage';

// Placeholder components for the other registration routes
const StudentRegistration = () => <div className="p-8 text-center text-2xl font-bold">Student Registration Page</div>;
const FacultyRegistration = () => <div className="p-8 text-center text-2xl font-bold">Faculty Registration Page</div>;
const NonTeachingStaffRegistration = () => <div className="p-8 text-center text-2xl font-bold">Non-Teaching Staff Registration Page</div>;
const LoginPage = () => <div className="p-8 text-center text-2xl font-bold">Student Login Page</div>;
const AdminLoginPage = () => <div className="p-8 text-center text-2xl font-bold">Admin Login Page</div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Registration Pages */}
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/registration/student" element={<StudentRegistration />} />
        <Route path="/registration/faculty" element={<FacultyRegistration />} />
        <Route path="/registration/non-teaching-staff" element={<NonTeachingStaffRegistration />} />

        {/* Login Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;