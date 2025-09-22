import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiUser, FiClock, FiEye, FiRefreshCw, FiSearch } from "react-icons/fi";
import AdminStudentDetailsModal from "./AdminStudentDetailsModal";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default function PendingStudents() {
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

  const BATCH_OPTIONS = [
    '',
    '2024-2027', '2024-2028', '2024-2029',
    '2025-2028', '2025-2029',
    '2026-2029', '2026-2030',
    // Add more as needed
  ];

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPendingStudents();
  }, [currentPage, selectedBatch]);

  const fetchPendingStudents = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/admin/list/pending?page=${currentPage}&limit=10`;
      if (selectedBatch) url += `&batch=${selectedBatch}`;
      const res = await axios.get(url, { withCredentials: true });
      setStudents(res.data.students || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setStudents([]);
      setTotalPages(1);
      Swal.fire({
        icon: "error",
        title: "Failed to load students",
        text: "Could not fetch pending students. Please try again later. Redirecting to login page...",
      });
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
      (student.firstName?.toLowerCase() || '').includes(searchLower) ||
      (student.lastName?.toLowerCase() || '').includes(searchLower) ||
      (student.email?.toLowerCase() || '').includes(searchLower) ||
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
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-yellow-50 via-white to-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiClock className="mr-2 text-yellow-500" />
                Pending Applications
              </h1>
              <p className="text-gray-600 mt-1">
                {students.length} student{students.length !== 1 ? "s" : ""}{" "}
                awaiting review
              </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex gap-4 items-center">
              {/* Search */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="name, email..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  title="search by name, email, id"
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>

              {/* Course Filter */}
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {/* Batch Filter */}
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Batches</option>
                {BATCH_OPTIONS.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>

              {/* Refresh */}
              <button
                onClick={fetchPendingStudents}
                className="px-4 cursor-pointer py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-all duration-150"
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiUser className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {searchTerm || selectedCourse || selectedGender
                ? "No matching students found"
                : "No pending applications"}
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || selectedCourse || selectedGender
                ? "Try different filters or keywords"
                : "All applications have been processed."}
            </p>
            {(searchTerm || selectedCourse || selectedGender) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCourse("");
                  setSelectedGender("");
                }}
                className="mt-4 cursor-pointer text-sm text-yellow-600 hover:text-yellow-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              {/* Add divide-x to thead and tbody rows for vertical lines */}
              <thead className="bg-gray-50">
                <tr className="divide-x divide-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">S.NO.</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Batch</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-gray-50 divide-x divide-gray-200">
                    <td className="px-4 py-4 text-sm text-gray-900">{(currentPage - 1) * 10 + idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold">
                        {student.firstName?.charAt(0) || 'N'}
                        {student.lastName?.charAt(0) || 'A'}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {student.firstName || 'N/A'} {student.middleName || ''}{" "}
                          {student.lastName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {student.studentId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">{student.email}</div>
                      <div className="text-gray-500 text-xs">{student.mobile}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.course}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.batch}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                        Pending Review
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="text-yellow-600 hover:text-yellow-800 inline-flex items-center cursor-pointer"
                      >
                        <FiEye className="mr-1" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 cursor-pointer py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 cursor-pointer py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && selectedStudent && (
        <AdminStudentDetailsModal
          student={selectedStudent}
          onClose={() => setModalOpen(false)}
          refresh={fetchPendingStudents}
          tableType="pending"
        />
      )}
    </div>
  );
}
