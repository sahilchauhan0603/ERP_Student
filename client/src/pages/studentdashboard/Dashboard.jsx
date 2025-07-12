import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem('studentEmail');
    navigate('/');
  };

  const email = localStorage.getItem('studentEmail') || "";

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
    axios
      .get(`${import.meta.env.VITE_API_URL}/student/dashboard?email=${encodeURIComponent(email)}`)
      .then((res) => {
        setStudent(res.data.student);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to fetch dashboard data");
        setLoading(false);
      });
  }, [email, navigate]);

  if (loading) return <div className="text-center py-16 text-lg text-blue-700">Loading dashboard...</div>;
  if (error) return <div className="text-center py-16 text-lg text-red-600">{error}</div>;
  if (!student) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h1 className="ml-2 text-xl font-bold text-gray-900"><Link to="/">Campus Pro</Link></h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <img className="h-8 w-8 rounded-full" src={student.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(student.firstName + " " + student.lastName)} alt="User avatar" />
                  <span className="hidden md:inline-block text-sm font-medium text-gray-700">{student.firstName} {student.lastName}</span>
                </button>
                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button onClick={() => navigate('/student/profile')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</button>
                  {/* <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a> */}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {student.firstName}!</h2>
                <p className="opacity-90">Your course: <b>{student.course}</b> | Category: <b>{student.category}</b></p>
              </div>
              <button className="mt-4 md:mt-0 bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition">
                View Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Enrolled Courses</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile</p>
              <p className="text-2xl font-bold">{student.mobile}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-2xl font-bold">{student.category}</p>
            </div>
          </div>
        </div>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Courses Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
            <div className="bg-indigo-600 p-4 text-white">
              <h3 className="text-lg font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                My Courses
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span>{student.course}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </li>
              </ul>
              <button 
                onClick={() => navigate('/student/courses')}
                className="mt-4 w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-100 transition"
              >
                View All Courses
              </button>
            </div>
          </div>

          {/* Assignments Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
            <div className="bg-blue-600 p-4 text-white">
              <h3 className="text-lg font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Recent Assignments
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { name: 'Algorithm Design', due: 'Tomorrow', status: 'Pending' },
                  { name: 'Database Project', due: 'In 3 days', status: 'In Progress' },
                  { name: 'Web App Prototype', due: 'Submitted', status: 'Completed' }
                ].map((assignment, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{assignment.name}</h4>
                        <p className="text-sm text-gray-500">Due: {assignment.due}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assignment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/student/assignments')}
                className="mt-4 w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition"
              >
                View All Assignments
              </button>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
            <div className="bg-purple-600 p-4 text-white">
              <h3 className="text-lg font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { title: 'New course material', message: 'Week 5 slides uploaded', time: '2 hours ago', unread: true },
                  { title: 'Assignment graded', message: 'Your DB project received 92%', time: '1 day ago', unread: false },
                  { title: 'Upcoming deadline', message: 'Algorithm assignment due tomorrow', time: '2 days ago', unread: false }
                ].map((notification, index) => (
                  <div key={index} className={`p-3 rounded-lg ${notification.unread ? 'bg-purple-50' : 'bg-white'}`}>
                    <div className="flex items-start">
                      {notification.unread && (
                        <span className="h-2 w-2 mt-1.5 mr-2 bg-purple-600 rounded-full"></span>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/student/notifications')}
                className="mt-4 w-full bg-purple-50 text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-100 transition"
              >
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;