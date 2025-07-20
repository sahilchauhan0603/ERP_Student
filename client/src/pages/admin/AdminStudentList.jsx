import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const statusColors = {
  approved: 'green',
  declined: 'red',
  pending: 'orange',
};

export default function AdminStudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/list`);
      setStudents(Array.isArray(res.data.students) ? res.data.students : []);
      setError('');
    } catch {
      setStudents([]);
      setError('Failed to load students');
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.post(`${API_URL}/admin/update-status`, { studentId: id, status });
      setActionMsg(`Status updated to ${status}`);
      fetchStudents();
    } catch (err) {
      setActionMsg('Failed to update status' + err.message);
    }
    setTimeout(() => setActionMsg(''), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto my-10 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Student Registrations</h2>
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500 mb-2">{error}</p>}
      {actionMsg && <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded mb-4 text-center font-medium">{actionMsg}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Course</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(students) && students.length > 0 ? (
              students.map(s => (
                <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-2 px-4">{s.firstName} {s.lastName}</td>
                  <td className="py-2 px-4">{s.email}</td>
                  <td className="py-2 px-4">{s.course}</td>
                  <td className="py-2 px-4">
                    <span className={
                      s.status === 'approved' ? 'text-green-600 font-bold' :
                      s.status === 'declined' ? 'text-red-600 font-bold' :
                      'text-orange-500 font-bold'
                    }>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded mr-2 disabled:bg-green-200 disabled:cursor-not-allowed"
                      disabled={s.status === 'approved'}
                      onClick={() => updateStatus(s.id, 'approved')}
                    >Approve</button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded disabled:bg-red-200 disabled:cursor-not-allowed"
                      disabled={s.status === 'declined'}
                      onClick={() => updateStatus(s.id, 'declined')}
                    >Decline</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="text-center text-gray-400 py-6">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
