import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiCheck, FiEye, FiRefreshCw, FiSearch } from 'react-icons/fi';
import AdminStudentDetailsModal from './AdminStudentDetailsModal';

const API_URL = import.meta.env.VITE_API_URL;

export default function ApprovedStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApprovedStudents();
  }, []);

  const fetchApprovedStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/list/approved`);
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

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with title and search */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiCheck className="mr-2 text-green-500" />
                Approved Students
              </h1>
              <p className="text-gray-600 mt-1">
                {students.length} student{students.length !== 1 ? 's' : ''} approved
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <button
                onClick={fetchApprovedStudents}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                title="Refresh"
              >
                <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiUser className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {searchTerm ? 'No matching students found' : 'No approved students'}
            </h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try a different search term' : 'No students have been approved yet'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-sm text-green-600 hover:text-green-800"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{student.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.mobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Approved
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="text-green-600 hover:text-green-800 flex items-center"
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
          refresh={fetchApprovedStudents}
          tableType="approved"
        />
      )}
    </div>
  );
}