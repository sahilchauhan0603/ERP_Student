import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminStudentDetailsModal from "./AdminStudentDetailsModal";
import {
  FiSearch,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiBook,
  FiClock,
  FiCheck,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_OPTIONS = [
  { label: "All Students", value: "", icon: <FiUser className="mr-1" /> },
  { label: "Pending", value: "pending", icon: <FiClock className="mr-1" /> },
  { label: "Approved", value: "approved", icon: <FiCheck className="mr-1" /> },
  { label: "Declined", value: "declined", icon: <FiX className="mr-1" /> },
];

const GENDER_OPTIONS = ["", "Male", "Female", "Other"];
const COURSE_OPTIONS = [
  "",
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
]; // Modify based on your actual course list

const BATCH_OPTIONS = [
  '',
  '2024-2027', '2024-2028', '2024-2029',
  '2025-2028', '2025-2029',
  '2026-2029', '2026-2030',
  // Add more as needed
];

export default function AdminAllStudents() {
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStudents();
  }, [status, currentPage]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/admin/list`;
      if (status) url = `${API_URL}/admin/list/${status}`;
      url += `?page=${currentPage}`;
      if (batchFilter) url += `&batch=${batchFilter}`;
      const res = await axios.get(url, { withCredentials: true });
      setStudents(res.data.students);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setStudents([]);
      Swal.fire({
        icon: "error",
        title: "Failed to load students",
        text: "Could not fetch student list. Please try again later. Redirecting to login page...",
      });
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (genderFilter) params.append("gender", genderFilter);
      if (courseFilter) params.append("course", courseFilter);
      if (batchFilter) params.append("batch", batchFilter);
      params.append("page", currentPage);

      const res = await axios.get(
        `${API_URL}/admin/search?${params.toString()}`,
        { withCredentials: true }
      );
      setStudents(res.data.students);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setStudents([]);
      Swal.fire({
        icon: "error",
        title: "Search failed",
        text: "Could not search students. Please try again later.",
      });
    }
    setLoading(false);
  };

  const refreshTable = () => {
    setSearch("");
    setGenderFilter("");
    setCourseFilter("");
    setBatchFilter("");
    fetchStudents();
  };

  const StatusBadge = ({ status }) => {
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "approved":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <FiCheck className="mr-1" /> Approved
          </span>
        );
      case "declined":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <FiX className="mr-1" /> Declined
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <FiClock className="mr-1" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Student Management
            </h2>
            <p className="text-sm text-gray-500">
              Manage all student applications
            </p>
          </div>
          <button
            onClick={refreshTable}
            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 bg-gray-50 space-y-4">
        {/* Search + Dropdown Filters */}
        <form
          className="flex flex-col md:flex-row md:items-center gap-4"
          onSubmit={handleSearch}
        >
          {/* Search Input */}
          <div className="relative flex-1 md:flex-[2]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="md:w-[150px] w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm"
          >
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g || "All Genders"}
              </option>
            ))}
          </select>

          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="md:w-[300px] w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm"
          >
            {COURSE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c || "All Courses"}
              </option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="md:w-[180px] w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm"
          >
            {BATCH_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b || "All Batches"}
              </option>
            ))}
          </select>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`inline-flex items-center px-4 py-2 rounded-lg border transition-all ${
                status === opt.value
                  ? "bg-blue-600 text-white border-blue-600 shadow-inner"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 shadow-sm"
              }`}
              onClick={() => {
                setStatus(opt.value);
                setSearch("");
                setCurrentPage(1);
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Add divide-x to thead and tbody rows for vertical lines */}
          <thead className="bg-gray-50">
            <tr className="divide-x divide-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.NO.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Batch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr className="divide-x divide-gray-200">
                <td colSpan={7} className="px-6 py-8 text-center">
                  <FiRefreshCw className="animate-spin text-gray-400 text-2xl mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">
                    Loading student data...
                  </p>
                </td>
              </tr>
            ) : students.length > 0 ? (
              students.map((student, idx) => (
                <tr className="hover:bg-gray-50 transition-colors divide-x divide-gray-200"
                  key={student.id}
                >
                  <td className="px-4 py-4 text-sm text-gray-900">{(currentPage - 1) * 10 + idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.studentId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 flex items-center">
                    <FiBook className="mr-1 text-gray-400" /> {student.course}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {student.batch}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelected(student);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="divide-x divide-gray-200">
                <td colSpan={7} className="px-6 py-8 text-center">
                  <FiUser className="text-gray-400 text-2xl mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">
                    No students found matching your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setGenderFilter("");
                      setCourseFilter("");
                      setBatchFilter("");
                      setStatus("");
                      setCurrentPage(1);
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Reset filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selected && (
        <AdminStudentDetailsModal
          student={selected}
          onClose={() => setShowModal(false)}
          refresh={fetchStudents}
          tableType={
            status === "pending"
              ? "pending"
              : status === "approved"
              ? "approved"
              : status === "declined"
              ? "declined"
              : "all"
          }
        />
      )}
    </div>
  );
}
