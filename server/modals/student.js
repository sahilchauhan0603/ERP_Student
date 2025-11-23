/**
 * =============================
 *  Table Relationships (ERD)
 * =============================
 *
 * students (id)
 *   └──< Student_SAR (student_id)
 *            ├──< SARacademic (SAR_id)
 *            ├──< SARintern (SAR_id)
 *            └──< SARAchievements (SAR_id)
 *
 * Foreign Key Details:
 * - Student_SAR.student_id      → students.id
 * - SARacademic.SAR_id         → Student_SAR.SAR_id
 * - SARintern.SAR_id           → Student_SAR.SAR_id
 * - SARAchievements.SAR_id     → Student_SAR.SAR_id
 *
 * Meaning:
 * - Each student can have one SAR record (Student_SAR)
 * - Each SAR can have multiple academic, internship, and achievement records
 *
 * (1) = one, (M) = many, ──< means one-to-many
 */
// Student table schema for MySQL
// This file is for reference and migration only (not used in runtime)

const studentTableSchema = `
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course VARCHAR(100),
  firstName VARCHAR(100),
  middleName VARCHAR(100),
  lastName VARCHAR(100),
  abcId VARCHAR(100),
  dob DATE,
  placeOfBirth VARCHAR(100),
  mobile VARCHAR(100),
  email VARCHAR(100),
  examRoll VARCHAR(100),
  examRank VARCHAR(100),
  gender VARCHAR(100),
  category VARCHAR(100),
  subCategory VARCHAR(100),
  region VARCHAR(100),
  currentAddress VARCHAR(255),
  permanentAddress VARCHAR(255),
  feeReimbursement VARCHAR(100),
  antiRaggingRef VARCHAR(100),
  classX_institute VARCHAR(100),
  classX_board VARCHAR(100),
  classX_year VARCHAR(100),
  classX_aggregate VARCHAR(100),
  classX_pcm VARCHAR(100),
  classX_isDiplomaOrPolytechnic VARCHAR(100),
  classXII_institute VARCHAR(100),
  classXII_board VARCHAR(100),
  classXII_year VARCHAR(100),
  classXII_aggregate VARCHAR(100),
  classXII_pcm VARCHAR(100),
  otherQualification_institute VARCHAR(100),
  otherQualification_board VARCHAR(100),
  otherQualification_year VARCHAR(100),
  otherQualification_aggregate VARCHAR(100),
  otherQualification_pcm VARCHAR(100),
  academicAchievements JSON,
  coCurricularAchievements JSON,
  photo VARCHAR(255),
  ipuRegistration VARCHAR(255),
  allotmentLetter VARCHAR(255),
  examAdmitCard VARCHAR(255),
  examScoreCard VARCHAR(255),
  marksheet10 VARCHAR(255),
  passing10 VARCHAR(255),
  marksheet12 VARCHAR(255),
  passing12 VARCHAR(255),
  aadhar VARCHAR(255),
  characterCertificate VARCHAR(255),
  medicalCertificate VARCHAR(255),
  migrationCertificate VARCHAR(255),
  categoryCertificate VARCHAR(255),
  specialCategoryCertificate VARCHAR(255),
  academicFeeReceipt VARCHAR(255),
  collegeFeeReceipt VARCHAR(255),
  parentSignature VARCHAR(255),
  father_name VARCHAR(100),
  father_qualification VARCHAR(100),
  father_occupation VARCHAR(100),
  father_email VARCHAR(100),
  father_mobile VARCHAR(100),
  father_telephoneSTD VARCHAR(100),
  father_telephone VARCHAR(100),
  father_officeAddress VARCHAR(255),
  mother_name VARCHAR(100),
  mother_qualification VARCHAR(100),
  mother_occupation VARCHAR(100),
  mother_email VARCHAR(100),
  mother_mobile VARCHAR(100),
  mother_telephoneSTD VARCHAR(100),
  mother_telephone VARCHAR(100),
  mother_officeAddress VARCHAR(255),
  familyIncome VARCHAR(100),
  status ENUM('pending','approved','declined') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  declinedFields TEXT,
  batch VARCHAR(100)
);
`;

const studentSARSchema = `
CREATE TABLE IF NOT EXISTS Student_SAR (
  SAR_id INT PRIMARY KEY,
  student_id INT,
  enrollment_no VARCHAR(100),
  microsoft_email VARCHAR(100),
  current_semester INT,
  sar_status ENUM('active', 'completed', 'suspended', 'inactive'),
  profile_completion_percentage DECIMAL(5,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
`;

const sarAcademicSchema = `
CREATE TABLE IF NOT EXISTS SARacademic (
  academic_id INT PRIMARY KEY,
  SAR_id INT,
  semester INT,
  academic_year VARCHAR(100),
  sgpa DECIMAL(10,2),
  cgpa DECIMAL(10,2),
  total_credits INT,
  earned_credits INT,
  attendance_percentage DECIMAL(10,2),
  subjects JSON,
  backlog_count INT,
  semester_result ENUM('pass', 'fail', 'ongoing', 'detained'),
  exam_month VARCHAR(100),
  exam_year YEAR,
  remarks TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
`;

const sarInternshipSchema = `
CREATE TABLE IF NOT EXISTS SARintern (
  internship_id INT PRIMARY KEY,
  SAR_id INT,
  company_name VARCHAR(255),
  position VARCHAR(255),
  internship_type ENUM('summer', 'winter', 'industrial', 'research', 'project', 'freelance', 'other'),
  start_date DATE,
  end_date DATE,
  duration_months INT,
  duration_weeks INT,
  stipend DECIMAL(10,2),
  currency VARCHAR(100),
  location VARCHAR(255),
  work_mode ENUM('onsite', 'remote', 'hybrid'),
  description TEXT,
  key_responsibilities TEXT,
  skills_learned JSON,
  technologies_used JSON,
  supervisor_name VARCHAR(255),
  supervisor_designation VARCHAR(255),
  supervisor_email VARCHAR(255),
  supervisor_phone VARCHAR(255),
  performance_rating ENUM('excellent', 'good', 'average', 'needs_improvement'),
  final_presentation TINYINT,
  offer_letter_received TINYINT,
  offer_letter VARCHAR(255),
  status ENUM('applied', 'selected', 'ongoing', 'completed', 'cancelled', 'terminated'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
`;

const sarAchievementSchema = `
CREATE TABLE IF NOT EXISTS SARAchievements (
  achievement_id INT PRIMARY KEY,
  SAR_id INT,
  title VARCHAR(255),
  category ENUM('academic', 'co-curricular', 'sports', 'technical', 'research', 'certification', 'competition', 'project', 'hackathon', 'publication', 'other'),
  subcategory VARCHAR(255),
  description TEXT,
  achievement_date DATE,
  level ENUM('college', 'university', 'district', 'state', 'national', 'international', 'global'),
  organization VARCHAR(255),
  event_name VARCHAR(255),
  position_rank VARCHAR(255),
  total_participants INT,
  team_size INT,
  team_members JSON,
  prize_amount DECIMAL(10,2),
  prize_currency VARCHAR(255),
  certificate_url VARCHAR(255),
  trophy_medal_received TINYINT,
  media_coverage TINYINT,
  media_urls JSON,
  skills_demonstrated JSON,
  technologies_used JSON,
  tags JSON,
  semester_achieved INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  date_of_event DATE
);
`;

module.exports = {
  studentTableSchema,
  studentSARSchema,
  sarAcademicSchema,
  sarInternshipSchema,
  sarAchievementSchema
};
