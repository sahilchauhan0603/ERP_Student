import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaGraduationCap, FaChartLine } from "react-icons/fa";

export default function SAROverview({ student, sarData, updateSAROverview }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    enrollment_no: sarData.sarInfo.enrollment_no,
    microsoft_email: sarData.sarInfo.microsoft_email,
    current_semester: sarData.sarInfo.current_semester
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      enrollment_no: sarData.sarInfo.enrollment_no,
      microsoft_email: sarData.sarInfo.microsoft_email,
      current_semester: sarData.sarInfo.current_semester
    });
  };

  const handleSave = () => {
    updateSAROverview(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      enrollment_no: sarData.sarInfo.enrollment_no,
      microsoft_email: sarData.sarInfo.microsoft_email,
      current_semester: sarData.sarInfo.current_semester
    });
  };

  const calculateCompletionPercentage = () => {
    let totalFields = 0;
    let filledFields = 0;

    // Check basic info
    totalFields += 2;
    if (sarData.sarInfo.enrollment_no) filledFields++;
    if (sarData.sarInfo.microsoft_email) filledFields++;

    // Check academic records (expect at least current semester)
    totalFields += sarData.sarInfo.current_semester;
    filledFields += sarData.academicRecords.length;

    // Bonus points for internships and achievements
    if (sarData.internships.length > 0) filledFields += 2;
    if (sarData.achievements.length > 0) filledFields += 2;
    totalFields += 4; // Maximum bonus

    return Math.min(Math.round((filledFields / totalFields) * 100), 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">SAR Overview</h2>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <FaEdit /> Edit Info
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center cursor-pointer justify-center gap-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
            >
              <FaSave /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center cursor-pointer justify-center gap-2 px-3 md:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm md:text-base"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
            <FaUser className="text-blue-600 text-sm md:text-base" />
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name
              </label>
              <div className="p-3 bg-white rounded-lg border">
                {student?.firstName} {student?.middleName} {student?.lastName}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.enrollment_no}
                  onChange={(e) => setEditForm(prev => ({ ...prev, enrollment_no: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter enrollment number"
                />
              ) : (
                <div className="p-3 bg-white rounded-lg border">
                  {sarData.sarInfo.enrollment_no || "Not set - Click Edit to add"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Email
              </label>
              <div className="p-3 bg-white rounded-lg border flex items-center gap-2">
                <FaEnvelope className="text-blue-600" />
                {student?.email || "Not available"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Microsoft Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.microsoft_email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, microsoft_email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Microsoft email (e.g., student@bpitindia.edu.in)"
                />
              ) : (
                <div className="p-3 bg-white rounded-lg border flex items-center gap-2">
                  <FaEnvelope className="text-green-600" />
                  {sarData.sarInfo.microsoft_email || "Not set - Click Edit to add"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Semester
              </label>
              {isEditing ? (
                <select
                  value={editForm.current_semester}
                  onChange={(e) => setEditForm(prev => ({ ...prev, current_semester: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-white rounded-lg border flex items-center gap-2">
                  <FaGraduationCap className="text-blue-600" />
                  Semester {sarData.sarInfo.current_semester}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-600 text-sm md:text-base" />
            SAR Statistics
          </h3>

          <div className="space-y-4">
            {/* Profile Completion */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-lg font-bold text-blue-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Record Counts */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-blue-600">{sarData.academicRecords.length}</div>
                <div className="text-xs text-gray-600">Academic Records</div>
              </div>
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-green-600">{sarData.internships.length}</div>
                <div className="text-xs text-gray-600">Internships</div>
              </div>
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-purple-600">{sarData.achievements.length}</div>
                <div className="text-xs text-gray-600">Achievements</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {sarData.academicRecords.length === 0 && sarData.internships.length === 0 && sarData.achievements.length === 0 ? (
                  <p className="text-gray-500 italic">No records added yet</p>
                ) : (
                  <>
                    {sarData.academicRecords.length > 0 && (
                      <p>✓ {sarData.academicRecords.length} academic record(s) added</p>
                    )}
                    {sarData.internships.length > 0 && (
                      <p>✓ {sarData.internships.length} internship(s) recorded</p>
                    )}
                    {sarData.achievements.length > 0 && (
                      <p>✓ {sarData.achievements.length} achievement(s) documented</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-sm text-blue-700">
            <strong>Next Steps:</strong>
            {sarData.academicRecords.length === 0 && " Add your academic records"}
            {sarData.academicRecords.length > 0 && sarData.internships.length === 0 && " Record your internships"}
            {sarData.internships.length > 0 && sarData.achievements.length === 0 && " Document your achievements"}
            {sarData.achievements.length > 0 && " Keep updating your records"}
          </div>
          <div className="text-sm text-blue-700">
            <strong>Completion Goal:</strong> Reach 100% profile completion
          </div>
          <div className="text-sm text-blue-700">
            <strong>Records Target:</strong> All {sarData.sarInfo.current_semester} semesters documented
          </div>
        </div>
      </div>
    </div>
  );
}