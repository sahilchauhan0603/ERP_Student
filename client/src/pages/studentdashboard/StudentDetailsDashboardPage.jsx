import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentDetailsDashboard from './Dashboard';

export default function StudentDetailsDashboardPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  
  useEffect(() => {
    if (studentId) {
      // Set student object with the ID
      setStudent({ id: studentId });
    } else {
      // If no studentId, redirect to home or show error
      navigate('/');
    }
  }, [studentId, navigate]);

  // Show loading if no student ID is available
  if (!studentId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">No student ID provided</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <StudentDetailsDashboard student={student} />;
}