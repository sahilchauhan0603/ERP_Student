import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBook, FaChartBar } from "react-icons/fa";

export default function AcademicRecords({ academicRecords, currentSemester, addRecord, updateRecord, deleteRecord }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // New Academic Record Form
  const [newRecord, setNewRecord] = useState({
    semester: 1,
    academic_year: "",
    sgpa: "",
    cgpa: "",
    total_credits: "",
    earned_credits: "",
    attendance_percentage: "",
    backlog_count: 0,
    semester_result: "ongoing",
    exam_month: "",
    exam_year: "",
    remarks: "",
    subjects: []
  });

  // Subject form for adding subjects to academic record
  const [newSubject, setNewSubject] = useState({
    subject_code: "",
    subject_name: "",
    subject_type: "core",
    credits: "",
    theory_marks: "",
    practical_marks: "",
    internal_marks: "",
    external_marks: "",
    total_marks: "",
    marks_obtained: "",
    grade: "",
    grade_points: "",
    passed: true,
    attendance: ""
  });

  const [showSubjectForm, setShowSubjectForm] = useState(false);

  const resetNewRecord = () => {
    setNewRecord({
      semester: 1,
      academic_year: "",
      sgpa: "",
      cgpa: "",
      total_credits: "",
      earned_credits: "",
      attendance_percentage: "",
      backlog_count: 0,
      semester_result: "ongoing",
      exam_month: "",
      exam_year: "",
      remarks: "",
      subjects: []
    });
    setShowAddForm(false);
    setShowSubjectForm(false);
  };

  const handleAddSubject = () => {
    setNewRecord(prev => ({
      ...prev,
      subjects: [...prev.subjects, { ...newSubject, id: Date.now() }]
    }));
    setNewSubject({
      subject_code: "",
      subject_name: "",
      subject_type: "core",
      credits: "",
      theory_marks: "",
      practical_marks: "",
      internal_marks: "",
      external_marks: "",
      total_marks: "",
      marks_obtained: "",
      grade: "",
      grade_points: "",
      passed: true,
      attendance: ""
    });
    setShowSubjectForm(false);
  };

  const handleSubmitRecord = () => {
    addRecord(newRecord);
    resetNewRecord();
  };

  const handleDeleteSubject = (subjectId) => {
    setNewRecord(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject.id !== subjectId)
    }));
  };

  const subjectTypes = ["core", "elective", "lab", "project", "seminar", "internship"];
  const semesterResults = ["ongoing", "passed", "failed", "withheld", "detained"];
  const grades = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBook className="text-blue-600" />
          Academic Records
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Add Semester Record
        </button>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Academic Record</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                value={newRecord.semester}
                onChange={(e) => setNewRecord(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <input
                type="text"
                value={newRecord.academic_year}
                onChange={(e) => setNewRecord(prev => ({ ...prev, academic_year: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2023-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={newRecord.sgpa}
                onChange={(e) => setNewRecord(prev => ({ ...prev, sgpa: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={newRecord.cgpa}
                onChange={(e) => setNewRecord(prev => ({ ...prev, cgpa: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Credits</label>
              <input
                type="number"
                min="0"
                value={newRecord.total_credits}
                onChange={(e) => setNewRecord(prev => ({ ...prev, total_credits: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Earned Credits</label>
              <input
                type="number"
                min="0"
                value={newRecord.earned_credits}
                onChange={(e) => setNewRecord(prev => ({ ...prev, earned_credits: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendance %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newRecord.attendance_percentage}
                onChange={(e) => setNewRecord(prev => ({ ...prev, attendance_percentage: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backlog Count</label>
              <input
                type="number"
                min="0"
                value={newRecord.backlog_count}
                onChange={(e) => setNewRecord(prev => ({ ...prev, backlog_count: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester Result</label>
              <select
                value={newRecord.semester_result}
                onChange={(e) => setNewRecord(prev => ({ ...prev, semester_result: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {semesterResults.map(result => (
                  <option key={result} value={result}>{result.charAt(0).toUpperCase() + result.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Month</label>
              <input
                type="text"
                value={newRecord.exam_month}
                onChange={(e) => setNewRecord(prev => ({ ...prev, exam_month: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., May"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Year</label>
              <input
                type="text"
                value={newRecord.exam_year}
                onChange={(e) => setNewRecord(prev => ({ ...prev, exam_year: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={newRecord.remarks}
              onChange={(e) => setNewRecord(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Any additional remarks about this semester..."
            />
          </div>

          {/* Subjects Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-semibold text-gray-800">Subjects ({newRecord.subjects.length})</h4>
              <button
                onClick={() => setShowSubjectForm(true)}
                className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <FaPlus /> Add Subject
              </button>
            </div>

            {/* Subject Form */}
            {showSubjectForm && (
              <div className="bg-white border rounded-lg p-4 mb-4">
                <h5 className="text-sm font-medium text-gray-800 mb-3">Add Subject</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Subject Code *"
                    value={newSubject.subject_code}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subject_code: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject Name *"
                    value={newSubject.subject_name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subject_name: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={newSubject.subject_type}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subject_type: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  >
                    {subjectTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Credits"
                    min="0"
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, credits: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Marks Obtained"
                    min="0"
                    value={newSubject.marks_obtained}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, marks_obtained: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Total Marks"
                    min="0"
                    value={newSubject.total_marks}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, total_marks: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                    value={newSubject.grade}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, grade: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Grade Points"
                    min="0"
                    max="10"
                    step="0.1"
                    value={newSubject.grade_points}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, grade_points: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Attendance %"
                    min="0"
                    max="100"
                    value={newSubject.attendance}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, attendance: e.target.value }))}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSubject}
                    className="px-3 cursor-pointer py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    disabled={!newSubject.subject_code || !newSubject.subject_name}
                  >
                    Add Subject
                  </button>
                  <button
                    onClick={() => setShowSubjectForm(false)}
                    className="px-3 cursor-pointer py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Added Subjects List */}
            {newRecord.subjects.length > 0 && (
              <div className="space-y-2">
                {newRecord.subjects.map((subject) => (
                  <div key={subject.id} className="bg-white border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-sm">{subject.subject_code} - {subject.subject_name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({subject.subject_type} • {subject.credits} credits • Grade: {subject.grade || 'N/A'})
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitRecord}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
              disabled={!newRecord.semester || !newRecord.academic_year}
            >
              <FaSave className="inline mr-2" />
              Save Academic Record
            </button>
            <button
              onClick={resetNewRecord}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="inline mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Records */}
      <div className="space-y-4">
        {academicRecords.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FaChartBar className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Academic Records Added</h3>
            <p className="text-gray-500 mb-4">Start by adding your semester-wise academic performance records.</p>
          </div>
        ) : (
          academicRecords.map((record) => (
            <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Semester {record.semester} • {record.academic_year}
                  </h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    {record.sgpa && <span>SGPA: <strong>{record.sgpa}</strong></span>}
                    {record.cgpa && <span>CGPA: <strong>{record.cgpa}</strong></span>}
                    {record.attendance_percentage && <span>Attendance: <strong>{record.attendance_percentage}%</strong></span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(record.id)}
                    className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-600 hover:text-red-800 p-2 cursor-pointer"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-sm">
                  <span className="text-gray-500">Credits:</span> {record.earned_credits}/{record.total_credits}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Backlogs:</span> {record.backlog_count}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Result:</span> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    record.semester_result === 'passed' ? 'bg-green-100 text-green-800' :
                    record.semester_result === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.semester_result}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Subjects:</span> {record.subjects?.length || 0}
                </div>
              </div>

              {record.subjects && record.subjects.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Subjects</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {record.subjects.map((subject, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3 text-sm">
                        <div className="font-medium">{subject.subject_code} - {subject.subject_name}</div>
                        <div className="text-gray-600 text-xs mt-1">
                          {subject.credits} credits • Grade: {subject.grade || 'N/A'} • 
                          {subject.marks_obtained && subject.total_marks ? 
                            ` ${subject.marks_obtained}/${subject.total_marks}` : ' Marks: N/A'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {record.remarks && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600">{record.remarks}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}