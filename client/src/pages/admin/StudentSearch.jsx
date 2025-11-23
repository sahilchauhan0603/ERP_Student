import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { formatFamilyIncome } from "../../utils/formatters";

export default function StudentSearch() {
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageTitle, setModalImageTitle] = useState("");

  // Image Modal Component
  const ImageModal = () => {
    if (!showImageModal) return null;

    return (
      <div className="fixed inset-0 bg-black/40 bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-800">
              {modalImageTitle}
            </h3>
            <button
              onClick={() => setShowImageModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-auto p-4">
            <img
              src={modalImageUrl}
              alt={modalImageTitle}
              className="w-full h-auto object-contain mx-auto"
              onError={(e) => {
                e.target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
              }}
            />
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
            <a
              href={modalImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open in New Tab
            </a>
            <button
              onClick={() => setShowImageModal(false)}
              className="px-4 py-2 bg-gray-600 text-white cursor-pointer rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Function to open image modal
  const openImageModal = (imageUrl, title) => {
    setModalImageUrl(imageUrl);
    setModalImageTitle(title);
    setShowImageModal(true);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!enrollmentNo.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: "Please enter an enrollment number",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/sar/admin/student/${enrollmentNo.trim()}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Flatten the nested structure for easier access
        const data = response.data.data;
        const flattenedData = {
          ...data.student,
          ...data.parents.father,
          father_name: data.parents.father.name,
          father_qualification: data.parents.father.qualification,
          father_occupation: data.parents.father.occupation,
          father_email: data.parents.father.email,
          father_mobile: data.parents.father.mobile,
          father_officeAddress: data.parents.father.officeAddress,
          mother_name: data.parents.mother.name,
          mother_qualification: data.parents.mother.qualification,
          mother_occupation: data.parents.mother.occupation,
          mother_email: data.parents.mother.email,
          mother_mobile: data.parents.mother.mobile,
          mother_officeAddress: data.parents.mother.officeAddress,
          familyIncome: data.parents.familyIncome,
          enrollmentNo: data.sarInfo?.enrollment_no || data.student.enrollmentNo,
          microsoft_email: data.sarInfo?.microsoft_email,
          current_semester: data.sarInfo?.current_semester,
          sar_status: data.sarInfo?.sar_status,
          profile_completion_percentage: data.sarInfo?.profile_completion_percentage,
          academicRecords: data.sar?.academic || [],
          internshipRecords: data.sar?.internships || [],
          achievementRecords: data.sar?.achievements || [],
          statistics: data.sar?.statistics || {}
        };
        setStudentData(flattenedData);
        setHasSearched(true);
      } else {
        throw new Error(response.data.message || "Student not found");
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      setStudentData(null);
      setHasSearched(true);

      Swal.fire({
        icon: "error",
        title: "Student Not Found",
        text: error.response?.data?.message || "No student found with this enrollment number",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setEnrollmentNo("");
    setStudentData(null);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Student Search
          </h1>
          <p className="text-gray-600">
            Search for student details by enrollment number
          </p>
        </div>

        {/* Search Bar - Centered when no results, Top right when results shown */}
        {!hasSearched || !studentData ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-2xl">
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full mb-4 shadow-lg">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Find Student
                  </h2>
                  <p className="text-gray-600">
                    Enter enrollment number to view complete student details
                  </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-6">
                  <div>
                    <label
                      htmlFor="enrollmentNo"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      id="enrollmentNo"
                      value={enrollmentNo}
                      onChange={(e) => setEnrollmentNo(e.target.value)}
                      placeholder="e.g., 2024CSE001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        Search Student
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search Bar - Top Right */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-200">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    placeholder="Search by enrollment number..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search
                </button>
                <button
                  type="button"
                  onClick={resetSearch}
                  className="bg-gray-200 text-gray-700 cursor-pointer px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear
                </button>
              </form>
            </div>

            {/* Student Details */}
            {studentData && (
              <div className="space-y-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Personal Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Photo */}
                      {studentData.photo && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex justify-center">
                          <div className="relative">
                            <img
                              src={studentData.photo}
                              alt={`${studentData.firstName} ${studentData.lastName}`}
                              className="w-48 h-48 rounded-lg object-cover border-4 border-purple-200 shadow-lg"
                            />
                            <div
                              className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                                studentData.status === "approved"
                                  ? "bg-green-600 text-white"
                                  : studentData.status === "declined"
                                    ? "bg-red-600 text-white"
                                    : "bg-yellow-600 text-white"
                              }`}
                            >
                              {studentData.status?.toUpperCase() || "PENDING"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Personal Details */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField label="First Name" value={studentData.firstName} />
                        <InfoField label="Middle Name" value={studentData.middleName} />
                        <InfoField label="Last Name" value={studentData.lastName} />
                        <InfoField label="Enrollment No" value={studentData.enrollmentNo} />
                        <InfoField label="Email" value={studentData.email} />
                        {studentData.microsoft_email && (
                          <InfoField label="Microsoft Email" value={studentData.microsoft_email} />
                        )}
                        <InfoField label="Mobile" value={studentData.mobile} />
                        <InfoField
                          label="Date of Birth"
                          value={
                            studentData.dob
                              ? new Date(studentData.dob).toLocaleDateString("en-IN")
                              : "N/A"
                          }
                        />
                        <InfoField label="Place of Birth" value={studentData.placeOfBirth} />
                        <InfoField label="Gender" value={studentData.gender} />
                        <InfoField label="Category" value={studentData.category} />
                        <InfoField label="Sub Category" value={studentData.subCategory} />
                        <InfoField label="Region" value={studentData.region} />
                        <InfoField label="Course" value={studentData.course} />
                        <InfoField label="Batch" value={studentData.batch} />
                        {studentData.current_semester && (
                          <InfoField label="Current Semester" value={studentData.current_semester} />
                        )}
                        {studentData.examRoll && (
                          <InfoField label="Exam Roll" value={studentData.examRoll} />
                        )}
                        {studentData.examRank && (
                          <InfoField label="Exam Rank" value={studentData.examRank} />
                        )}
                        {studentData.abcId && (
                          <InfoField label="ABC ID" value={studentData.abcId} />
                        )}
                        {studentData.profile_completion_percentage && (
                          <InfoField 
                            label="Profile Completion" 
                            value={`${parseFloat(studentData.profile_completion_percentage).toFixed(2)}%`} 
                          />
                        )}
                      </div>
                    </div>

                    {/* Addresses */}
                    {(studentData.currentAddress || studentData.permanentAddress) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Addresses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {studentData.currentAddress && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Current Address</p>
                              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                {studentData.currentAddress}
                              </p>
                            </div>
                          )}
                          {studentData.permanentAddress && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Permanent Address</p>
                              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                {studentData.permanentAddress}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parents Information Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Parents Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Father's Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                            Father
                          </span>
                        </h3>
                        <div className="space-y-3">
                          <InfoField label="Name" value={studentData.father_name} />
                          <InfoField label="Qualification" value={studentData.father_qualification} />
                          <InfoField label="Occupation" value={studentData.father_occupation} />
                          <InfoField label="Email" value={studentData.father_email} />
                          <InfoField label="Mobile" value={studentData.father_mobile} />
                          {studentData.father_officeAddress && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Office Address</p>
                              <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                                {studentData.father_officeAddress}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mother's Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm">
                            Mother
                          </span>
                        </h3>
                        <div className="space-y-3">
                          <InfoField label="Name" value={studentData.mother_name} />
                          <InfoField label="Qualification" value={studentData.mother_qualification} />
                          <InfoField label="Occupation" value={studentData.mother_occupation} />
                          <InfoField label="Email" value={studentData.mother_email} />
                          <InfoField label="Mobile" value={studentData.mother_mobile} />
                          {studentData.mother_officeAddress && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Office Address</p>
                              <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                                {studentData.mother_officeAddress}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Family Income */}
                    {studentData.familyIncome && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <InfoField
                          label="Family Income"
                          value={formatFamilyIncome(studentData.familyIncome)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Records */}
                {studentData.academicRecords && studentData.academicRecords.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        Academic Records
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        {studentData.academicRecords.map((record, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200"
                          >
                            {/* Semester Header */}
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-blue-300">
                              <h3 className="text-xl font-bold text-gray-800">
                                Semester {record.semester} - {record.academic_year}
                              </h3>
                              <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                                record.semester_result === 'pass' 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }`}>
                                {record.semester_result?.toUpperCase() || 'N/A'}
                              </span>
                            </div>

                            {/* Semester Summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                              <InfoField label="SGPA" value={record.sgpa} />
                              <InfoField label="CGPA" value={record.cgpa} />
                              <InfoField label="Attendance" value={`${record.attendance_percentage}%`} />
                              <InfoField label="Total Credits" value={record.total_credits} />
                              <InfoField label="Earned Credits" value={record.earned_credits} />
                              <InfoField label="Backlogs" value={record.backlog_count} />
                              <InfoField label="Exam Month" value={record.exam_month} />
                              <InfoField label="Exam Year" value={record.exam_year} />
                              {record.remarks && (
                                <div className="col-span-2">
                                  <InfoField label="Remarks" value={record.remarks} />
                                </div>
                              )}
                            </div>

                            {/* Subjects */}
                            {record.subjects && record.subjects.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Subjects</h4>
                                <div className="space-y-3">
                                  {record.subjects.map((subject, subIndex) => (
                                    <div
                                      key={subIndex}
                                      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <div>
                                          <h5 className="font-bold text-gray-800">
                                            {subject.subject_code} - {subject.subject_name}
                                          </h5>
                                          <div className="flex gap-3 mt-1">
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                              {subject.subject_type?.toUpperCase() || 'N/A'}
                                            </span>
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                              Credits: {subject.credits}
                                            </span>
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                              Attendance: {subject.attendance}%
                                            </span>
                                          </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                          subject.passed 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-red-500 text-white'
                                        }`}>
                                          {subject.passed ? 'PASSED' : 'FAILED'}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Theory Section */}
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                          <h6 className="font-semibold text-blue-800 mb-2">Theory</h6>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <InfoField label="Grade" value={subject.theory_grade} />
                                            <InfoField label="Grade Points" value={subject.theory_grade_points} />
                                            <InfoField label="Total" value={subject.total_theory} />
                                            <InfoField label="External" value={subject.external_theory} />
                                            <InfoField label="Internal" value={subject.internal_theory} />
                                          </div>
                                        </div>

                                        {/* Practical Section */}
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                          <h6 className="font-semibold text-purple-800 mb-2">Practical</h6>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <InfoField label="Grade" value={subject.practical_grade} />
                                            <InfoField label="Grade Points" value={subject.practical_grade_points} />
                                            <InfoField label="Total" value={subject.total_practical} />
                                            <InfoField label="External" value={subject.external_practical} />
                                            <InfoField label="Internal" value={subject.internal_practical} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Internship Records */}
                {studentData.internshipRecords && studentData.internshipRecords.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Internship Records
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        {studentData.internshipRecords.map((record, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200"
                          >
                            {/* Internship Header */}
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-blue-300">
                              <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                  {record.company_name}
                                </h3>
                                <p className="text-gray-600 font-medium">{record.position}</p>
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                                  {record.internship_type?.toUpperCase() || 'N/A'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  record.status === 'completed' ? 'bg-green-600 text-white' :
                                  record.status === 'ongoing' ? 'bg-blue-600 text-white' :
                                  'bg-yellow-600 text-white'
                                }`}>
                                  {record.status?.toUpperCase() || 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                              <InfoField 
                                label="Start Date" 
                                value={record.start_date ? new Date(record.start_date).toLocaleDateString("en-IN") : "N/A"} 
                              />
                              <InfoField 
                                label="End Date" 
                                value={record.end_date ? new Date(record.end_date).toLocaleDateString("en-IN") : "N/A"} 
                              />
                              <InfoField label="Duration" value={`${record.duration_months} months, ${record.duration_weeks} weeks`} />
                              <InfoField label="Stipend" value={`${record.currency} ${parseFloat(record.stipend).toLocaleString()}`} />
                              <InfoField label="Location" value={record.location} />
                              <InfoField label="Work Mode" value={record.work_mode?.toUpperCase()} />
                              <InfoField label="Performance Rating" value={record.performance_rating?.toUpperCase()} />
                              <InfoField label="Final Presentation" value={record.final_presentation ? 'Yes' : 'No'} />
                            </div>

                            {/* Description */}
                            {record.description && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1 font-semibold">Description</p>
                                <p className="text-gray-800 bg-white p-3 rounded-lg">{record.description}</p>
                              </div>
                            )}

                            {/* Key Responsibilities */}
                            {record.key_responsibilities && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1 font-semibold">Key Responsibilities</p>
                                <p className="text-gray-800 bg-white p-3 rounded-lg">{record.key_responsibilities}</p>
                              </div>
                            )}

                            {/* Skills & Technologies */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {record.skills_learned && record.skills_learned.length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-2 font-semibold">Skills Learned</p>
                                  <div className="flex flex-wrap gap-2">
                                    {record.skills_learned.map((skill, idx) => (
                                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {record.technologies_used && record.technologies_used.length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-2 font-semibold">Technologies Used</p>
                                  <div className="flex flex-wrap gap-2">
                                    {record.technologies_used.map((tech, idx) => (
                                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Supervisor Details */}
                            {record.supervisor_name && (
                              <div className="bg-white p-4 rounded-lg mb-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Supervisor Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                  <InfoField label="Name" value={record.supervisor_name} />
                                  <InfoField label="Designation" value={record.supervisor_designation} />
                                  <InfoField label="Email" value={record.supervisor_email} />
                                  <InfoField label="Phone" value={record.supervisor_phone} />
                                </div>
                              </div>
                            )}

                            {/* Offer Letter */}
                            {record.offer_letter && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 font-semibold">Offer Letter:</span>
                                <button
                                  onClick={() => openImageModal(record.offer_letter, `${record.company_name} - Offer Letter`)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Document
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievement Records */}
                {studentData.achievementRecords && studentData.achievementRecords.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        Achievement Records
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        {studentData.achievementRecords.map((record, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200"
                          >
                            {/* Achievement Header */}
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-blue-300">
                              <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                  {record.title}
                                </h3>
                                <div className="flex gap-2 mt-2">
                                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                                    {record.category?.toUpperCase() || 'N/A'}
                                  </span>
                                  {record.subcategory && (
                                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-bold">
                                      {record.subcategory?.toUpperCase()}
                                    </span>
                                  )}
                                  <span className="px-3 py-1 bg-blue-700 text-white rounded-full text-sm font-bold">
                                    {record.level?.toUpperCase() || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              {record.position_rank && (
                                <div className="text-right">
                                  <div className="text-3xl font-bold text-blue-600">{record.position_rank}</div>
                                  {record.trophy_medal_received === 1 && (
                                    <span className="text-sm text-gray-600">🏆 Trophy Received</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                              <InfoField label="Organization" value={record.organization} />
                              <InfoField label="Event Name" value={record.event_name} />
                              <InfoField 
                                label="Achievement Date" 
                                value={record.achievement_date ? new Date(record.achievement_date).toLocaleDateString("en-IN") : "N/A"} 
                              />
                              {record.date_of_event && (
                                <InfoField 
                                  label="Event Date" 
                                  value={new Date(record.date_of_event).toLocaleDateString("en-IN")} 
                                />
                              )}
                              <InfoField label="Total Participants" value={record.total_participants} />
                              <InfoField label="Team Size" value={record.team_size} />
                              <InfoField label="Semester" value={record.semester_achieved} />
                              {record.prize_amount && (
                                <InfoField 
                                  label="Prize Money" 
                                  value={`${record.prize_currency} ${parseFloat(record.prize_amount).toLocaleString()}`} 
                                />
                              )}
                            </div>

                            {/* Description */}
                            {record.description && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1 font-semibold">Description</p>
                                <p className="text-gray-800 bg-white p-3 rounded-lg">{record.description}</p>
                              </div>
                            )}

                            {/* Team Members */}
                            {record.team_members && record.team_members.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2 font-semibold">Team Members</p>
                                <div className="flex flex-wrap gap-2">
                                  {record.team_members.map((member, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                      {member}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Skills & Technologies */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {record.skills_demonstrated && record.skills_demonstrated.length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-2 font-semibold">Skills Demonstrated</p>
                                  <div className="flex flex-wrap gap-2">
                                    {record.skills_demonstrated.map((skill, idx) => (
                                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {record.technologies_used && record.technologies_used.length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-2 font-semibold">Technologies Used</p>
                                  <div className="flex flex-wrap gap-2">
                                    {record.technologies_used.map((tech, idx) => (
                                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            {record.tags && record.tags.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2 font-semibold">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                  {record.tags.map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Media & Links */}
                            <div className="flex flex-wrap gap-4">
                              {record.certificate_url && (
                                <a
                                  href={record.certificate_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  View Certificate
                                </a>
                              )}
                              {record.media_coverage === 1 && record.media_urls && record.media_urls.length > 0 && (
                                <div className="flex gap-2">
                                  {record.media_urls.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                      View Media {idx + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SAR Statistics Summary */}
                {studentData.statistics && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        SAR Statistics Summary
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-xl border-2 border-blue-300 text-center">
                          <div className="text-4xl font-bold text-blue-700 mb-2">
                            {studentData.statistics.totalAcademicRecords || 0}
                          </div>
                          <div className="text-gray-700 font-semibold">Academic Semesters</div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-6 rounded-xl border-2 border-indigo-300 text-center">
                          <div className="text-4xl font-bold text-indigo-700 mb-2">
                            {studentData.statistics.totalInternships || 0}
                          </div>
                          <div className="text-gray-700 font-semibold">Internships</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-xl border-2 border-blue-300 text-center">
                          <div className="text-4xl font-bold text-blue-700 mb-2">
                            {studentData.statistics.totalAchievements || 0}
                          </div>
                          <div className="text-gray-700 font-semibold">Achievements</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal />
    </div>
  );
}

// Reusable InfoField Component
function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-gray-800 font-medium">{value || "N/A"}</p>
    </div>
  );
}
