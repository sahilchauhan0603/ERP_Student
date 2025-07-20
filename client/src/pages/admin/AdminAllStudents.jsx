import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminStudentDetailsModal from './AdminStudentDetailsModal';
import { FiSearch, FiRefreshCw, FiUser, FiMail, FiBook, FiClock, FiCheck, FiX } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = [
  { label: 'All Students', value: '', icon: <FiUser className="mr-1" /> },
  { label: 'Pending', value: 'pending', icon: <FiClock className="mr-1" /> },
  { label: 'Approved', value: 'approved', icon: <FiCheck className="mr-1" /> },
  { label: 'Declined', value: 'declined', icon: <FiX className="mr-1" /> },
];

export default function AdminAllStudents() {
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
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
      
      const res = await axios.get(url);
      setStudents(res.data.students);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return fetchStudents();
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/search?q=${encodeURIComponent(search)}&page=${currentPage}`);
      setStudents(res.data.students);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };

  const refreshTable = () => {
    setSearch('');
    fetchStudents();
  };

  const StatusBadge = ({ status }) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    
    switch(status) {
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}><FiCheck className="mr-1" /> Approved</span>;
      case 'declined':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}><FiX className="mr-1" /> Declined</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><FiClock className="mr-1" /> Pending</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table Header with Controls */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Student Management</h2>
            <p className="text-sm text-gray-500">Manage all student applications</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={refreshTable}
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <form className="flex-1 flex gap-2" onSubmit={handleSearch}>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Status Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`inline-flex items-center px-4 py-2 rounded-lg border transition-all ${status === opt.value ? 'bg-blue-600 text-white border-blue-600 shadow-inner' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 shadow-sm'}`}
              onClick={() => { setStatus(opt.value); setSearch(''); setCurrentPage(1); }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <FiRefreshCw className="animate-spin text-gray-400 text-2xl" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading student data...</p>
                </td>
              </tr>
            ) : students.length > 0 ? (
              students.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FiBook className="mr-1 text-gray-400" />
                      {student.course}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => { setSelected(student); setShowModal(true); }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <FiUser className="text-gray-400 text-2xl" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">No students found matching your criteria</p>
                  <button 
                    onClick={() => { setSearch(''); setStatus(''); setCurrentPage(1); }}
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
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showModal && selected && (
        <AdminStudentDetailsModal
          student={selected}
          onClose={() => setShowModal(false)}
          refresh={fetchStudents}
          tableType={
            status === 'pending' ? 'pending' :
            status === 'approved' ? 'approved' :
            status === 'declined' ? 'declined' : 'all'
          }
        />
      )}
    </div>
  );
}