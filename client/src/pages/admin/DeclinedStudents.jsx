import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiUser, FiXCircle, FiEye, FiRefreshCw, FiSearch } from "react-icons/fi";
import AdminStudentDetailsModal from "./AdminStudentDetailsModal";

const API_URL = import.meta.env.VITE_API_URL;

export default function DeclinedStudents() {
  const courses = [
    "B.Tech Computer Science Engineering (CSE)",
    "B.Tech Information Technology Engineering (IT)",
    "B.Tech Electronics and Communication Engineering (ECE)",
    "B.Tech Electrical and Electronics Engineering (EEE)",
    "B.Tech Artificial Intelligence and Data Science Engineering (AI-DS)",
    "B.Tech Computer Science Engineering with specialization in Data Science (CSE-DS)",
    "LE-B.Tech Computer Science Engineering (CSE)",
    "LE-B.Tech Information Technology Engineering (IT)",
    "LE-B.Tech Electronics and Communication Engineering (ECE)",
    "LE-B.Tech Electrical and Electronics Engineering (EEE)",
    "BBA",
    "MBA",
  ];

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGender, setSelectedGender] = useState("");

  useEffect(() => {
    fetchDeclinedStudents();
  }, []);

  const fetchDeclinedStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/list/declined`);
      setStudents(res.data.students || []);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      (student.studentId &&
        student.studentId.toLowerCase().includes(searchLower));
    const matchesCourse = selectedCourse
      ? student.course === selectedCourse
      : true;
    const matchesGender = selectedGender
      ? student.gender === selectedGender
      : true;

    return matchesSearch && matchesCourse && matchesGender;
  });

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        {/* Header with Filters */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 via-white to-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiXCircle className="mr-2 text-red-500" />
                Declined Students
              </h1>
              <p className="text-gray-600 mt-1">
                {students.length} student{students.length !== 1 ? "s" : ""}{" "}
                declined
              </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex gap-4 items-center">
              {/* Search */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="name, email, ID..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>

              {/* Course Filter */}
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>

              {/* Gender Filter */}
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {/* Refresh */}
              <button
                onClick={fetchDeclinedStudents}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-all duration-150"
                title="Refresh"
              >
                <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiUser className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {searchTerm || selectedCourse || selectedGender
                ? "No matching students found"
                : "No declined students"}
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || selectedCourse || selectedGender
                ? "Try different filters or keywords"
                : "No students have been declined yet."}
            </p>
            {(searchTerm || selectedCourse || selectedGender) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCourse("");
                  setSelectedGender("");
                }}
                className="mt-4 text-sm text-red-600 hover:text-red-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <div className="h-10 w-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.middleName}{" "}
                          {student.lastName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {student.studentId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">{student.email}</div>
                      <div className="text-gray-500 text-xs">
                        {student.mobile}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                        Declined
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center"
                      >
                        <FiEye className="mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && selectedStudent && (
        <AdminStudentDetailsModal
          student={selectedStudent}
          onClose={() => setModalOpen(false)}
          refresh={fetchDeclinedStudents}
          tableType="declined"
        />
      )}
    </div>
  );
}