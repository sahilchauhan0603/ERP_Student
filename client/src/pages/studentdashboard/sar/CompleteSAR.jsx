import React from "react";
import { FaUser, FaGraduationCap, FaBriefcase, FaTrophy, FaCalendar, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";

export default function CompleteSAR({ student, sarData }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'sports': return 'bg-yellow-100 text-yellow-800';
      case 'cultural': return 'bg-pink-100 text-pink-800';
      case 'social': return 'bg-green-100 text-green-800';
      case 'leadership': return 'bg-indigo-100 text-indigo-800';
      case 'research': return 'bg-red-100 text-red-800';
      case 'entrepreneurship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'international': return 'bg-red-100 text-red-800';
      case 'national': return 'bg-orange-100 text-orange-800';
      case 'state': return 'bg-yellow-100 text-yellow-800';
      case 'university': return 'bg-blue-100 text-blue-800';
      case 'college': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'selected': return 'bg-purple-100 text-purple-800';
      case 'applied': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalAchievements = sarData.achievements.length;
  const totalInternships = sarData.internships.length;
  const completedInternships = sarData.internships.length;
  const totalSemesters = sarData.academicRecords.length;
  
  // Calculate completion percentage (same logic as SAROverview)
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

    // Bonus points for completed internships and achievements
    const completedInternships = sarData.internships.length;
    if (completedInternships > 0) filledFields += 2;
    if (sarData.achievements.length > 0) filledFields += 2;
    totalFields += 4; // Maximum bonus

    return Math.min(Math.round((filledFields / totalFields) * 100), 100);
  };

  const completionPercentage = calculateCompletionPercentage();
  
  // Calculate average CGPA
  const cgpaRecords = sarData.academicRecords.filter(r => r.cgpa && parseFloat(r.cgpa) > 0);
  const averageCGPA = cgpaRecords.length > 0 
    ? (cgpaRecords.reduce((sum, r) => sum + parseFloat(r.cgpa), 0) / cgpaRecords.length).toFixed(2)
    : 'N/A';

  // Group achievements by category
  const achievementsByCategory = sarData.achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Complete Student Academic Record</h2>
        <p className="text-lg text-gray-600">Comprehensive overview of academic journey and achievements</p>
      </div>

      {/* Header Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Student Information
            </h3>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {student?.firstName} {student?.middleName} {student?.lastName}</div>
              <div><strong>Enrollment No:</strong> {sarData.sarInfo.enrollment_no || 'Not set'}</div>
              <div><strong>Personal Email:</strong> {student?.email}</div>
              <div><strong>Microsoft Email:</strong> {sarData.sarInfo.microsoft_email || 'Not provided'}</div>
              <div><strong>Mobile:</strong> {student?.mobile}</div>
              <div><strong>Course:</strong> {student?.course}</div>
              <div><strong>Current Semester:</strong> {sarData.sarInfo.current_semester}</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-green-600" />
              Academic Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{totalSemesters}</div>
                <div className="text-xs text-gray-600">Semesters Recorded</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-600">{averageCGPA}</div>
                <div className="text-xs text-gray-600">Average CGPA</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-600">{completedInternships}</div>
                <div className="text-xs text-gray-600">Completed Internships</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-yellow-600">{totalAchievements}</div>
                <div className="text-xs text-gray-600">Total Achievements</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Records Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaGraduationCap className="text-blue-600" />
          Academic Records ({sarData.academicRecords.length})
        </h3>
        
        {sarData.academicRecords.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No academic records added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sarData.academicRecords.map((record, index) => (
              <div key={index} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-800">Semester {record.semester}</h4>
                  <span className="text-sm text-gray-500">{record.academic_year}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  {record.sgpa && (
                    <div><span className="text-gray-500">SGPA:</span> <strong>{record.sgpa}</strong></div>
                  )}
                  {record.cgpa && (
                    <div><span className="text-gray-500">CGPA:</span> <strong>{record.cgpa}</strong></div>
                  )}
                  {record.attendance_percentage && (
                    <div><span className="text-gray-500">Attendance:</span> {record.attendance_percentage}%</div>
                  )}
                  <div><span className="text-gray-500">Backlogs:</span> {record.backlog_count || 0}</div>
                  {record.earned_credits && record.total_credits && (
                    <div><span className="text-gray-500">Credits:</span> {record.earned_credits}/{record.total_credits}</div>
                  )}
                  <div>
                    <span className="text-gray-500">Result:</span>
                    <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                      record.semester_result === 'passed' ? 'bg-green-100 text-green-800' :
                      record.semester_result === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.semester_result}
                    </span>
                  </div>
                </div>

                {record.subjects && record.subjects.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Subjects ({record.subjects.length})</h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {record.subjects.map((subject, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 rounded p-2">
                          <div className="font-medium">{subject.subject_code} - {subject.subject_name}</div>
                          <div className="text-gray-600">
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
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600">{record.remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Internships Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaBriefcase className="text-purple-600" />
          Internship Experience ({sarData.internships.length})
        </h3>
        
        {sarData.internships.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No internships recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {sarData.internships.map((internship, index) => (
              <div key={index} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{internship.position}</h4>
                    <p className="text-blue-600 font-medium">{internship.company_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(internship.status)}`}>
                    {internship.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    {internship.location || 'Remote'} ({internship.work_mode})
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-gray-400" />
                    {formatDate(internship.start_date)} - {formatDate(internship.end_date)}
                  </div>
                  {internship.stipend && (
                    <div>
                      <strong>Stipend:</strong> {internship.stipend} {internship.currency}
                    </div>
                  )}
                </div>

                {internship.description && (
                  <p className="text-sm text-gray-600 mb-3">{internship.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {internship.skills_learned && internship.skills_learned.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Skills Learned</h5>
                      <div className="flex flex-wrap gap-1">
                        {internship.skills_learned.map((skill, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {internship.technologies_used && internship.technologies_used.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Technologies Used</h5>
                      <div className="flex flex-wrap gap-1">
                        {internship.technologies_used.map((tech, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {internship.supervisor_name && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaUser className="text-gray-400" />
                      <span>
                        Supervisor: {internship.supervisor_name}
                        {internship.supervisor_designation && ` - ${internship.supervisor_designation}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-600" />
          Achievements & Awards ({sarData.achievements.length})
        </h3>
        
        {sarData.achievements.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No achievements recorded yet.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(achievementsByCategory).map(category => (
              <div key={category}>
                <h4 className="text-lg font-medium text-gray-800 mb-3 capitalize flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryColor(category)}`}>
                    {category}
                  </span>
                  ({achievementsByCategory[category].length})
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievementsByCategory[category].map((achievement, index) => (
                    <div key={index} className="bg-white border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-semibold text-gray-800">{achievement.title}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(achievement.level)}`}>
                          {achievement.level}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm mb-3">
                        {achievement.organization && (
                          <div><span className="text-gray-500">Organization:</span> {achievement.organization}</div>
                        )}
                        {achievement.event_name && (
                          <div><span className="text-gray-500">Event:</span> {achievement.event_name}</div>
                        )}
                        {achievement.position_rank && (
                          <div><span className="text-gray-500">Position:</span> <strong>{achievement.position_rank}</strong></div>
                        )}
                        {achievement.achievement_date && (
                          <div><span className="text-gray-500">Date:</span> {formatDate(achievement.achievement_date)}</div>
                        )}
                        {achievement.semester_achieved && (
                          <div><span className="text-gray-500">Semester:</span> {achievement.semester_achieved}</div>
                        )}
                      </div>

                      {achievement.description && (
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      )}

                      {achievement.skills_demonstrated && achievement.skills_demonstrated.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-sm font-medium text-gray-700 mb-1">Skills Demonstrated</h6>
                          <div className="flex flex-wrap gap-1">
                            {achievement.skills_demonstrated.map((skill, idx) => (
                              <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {achievement.technologies_used && achievement.technologies_used.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-sm font-medium text-gray-700 mb-1">Technologies Used</h6>
                          <div className="flex flex-wrap gap-1">
                            {achievement.technologies_used.map((tech, idx) => (
                              <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {achievement.team_members && achievement.team_members.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-sm font-medium text-gray-700 mb-1">Team Members</h6>
                          <div className="flex flex-wrap gap-1">
                            {achievement.team_members.map((member, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 text-xs text-gray-500">
                        {achievement.trophy_medal_received && <span>🏆 Trophy/Medal</span>}
                        {achievement.media_coverage && <span>📰 Media Coverage</span>}
                        {achievement.certificate_url && <span>📜 Certificate</span>}
                        {achievement.prize_amount && <span>💰 Prize Money</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">SAR Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{totalSemesters}/8</div>
            <div className="text-sm text-gray-600">Semesters Completed</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{averageCGPA}</div>
            <div className="text-sm text-gray-600">Overall CGPA</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{totalInternships}</div>
            <div className="text-sm text-gray-600">Total Internships</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{totalAchievements}</div>
            <div className="text-sm text-gray-600">Total Achievements</div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Last Updated: {new Date().toLocaleDateString('en-GB')} • 
          Profile Completion: <strong>{completionPercentage}%</strong></p>
        </div>
      </div>
    </div>
  );
}