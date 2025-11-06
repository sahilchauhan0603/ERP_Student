// Student table schema for MySQL
// This file is for reference and migration only (not used in runtime)

const studentTableSchema = `
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course VARCHAR(100),
  firstName VARCHAR(100),
  middleName VARCHAR(100),
  lastName VARCHAR(100),
  abcId VARCHAR(100) UNIQUE,
  dob DATE,
  placeOfBirth VARCHAR(100),
  mobile VARCHAR(20),
  email VARCHAR(100) UNIQUE,
  examRoll VARCHAR(100),
  examRank VARCHAR(100),
  gender VARCHAR(20),
  category VARCHAR(50),
  subCategory VARCHAR(50),
  region VARCHAR(50),
  currentAddress VARCHAR(255),
  permanentAddress VARCHAR(255),
  feeReimbursement VARCHAR(100),
  antiRaggingRef VARCHAR(100),

  classX_institute VARCHAR(100),
  classX_board VARCHAR(100),
  classX_year VARCHAR(10),
  classX_aggregate VARCHAR(20),
  classX_pcm VARCHAR(20),
  classX_isDiplomaOrPolytechnic VARCHAR(10),

  classXII_institute VARCHAR(100),
  classXII_board VARCHAR(100),
  classXII_year VARCHAR(10),
  classXII_aggregate VARCHAR(20),
  classXII_pcm VARCHAR(20),

  otherQualification_institute VARCHAR(100),
  otherQualification_board VARCHAR(100),
  otherQualification_year VARCHAR(10),
  otherQualification_aggregate VARCHAR(20),
  otherQualification_pcm VARCHAR(20),

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
  father_mobile VARCHAR(20),
  father_telephoneSTD VARCHAR(20),
  father_telephone VARCHAR(20),
  father_officeAddress VARCHAR(255),

  mother_name VARCHAR(100),
  mother_qualification VARCHAR(100),
  mother_occupation VARCHAR(100),
  mother_email VARCHAR(100),
  mother_mobile VARCHAR(20),
  mother_telephoneSTD VARCHAR(20),
  mother_telephone VARCHAR(20),
  mother_officeAddress VARCHAR(255),

  familyIncome VARCHAR(100),
  status ENUM('pending','approved','declined') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  declinedFields TEXT,
  batch VARCHAR(20)
);
`;

// SAR (Student Academic Record) Table Schemas
// 1. Main SAR Table
const studentSARSchema = `
CREATE TABLE IF NOT EXISTS Student_SAR (
  SAR_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  enrollment_no VARCHAR(100) NULL COMMENT 'Student enrollment number',
  microsoft_email VARCHAR(100) NULL COMMENT 'Microsoft email assigned to student',
  current_semester INT NULL CHECK (current_semester >= 1 AND current_semester <= 8) COMMENT 'Current active semester',
  sar_status ENUM('active', 'completed', 'suspended', 'inactive') DEFAULT 'active',
  profile_completion_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'SAR profile completion percentage',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_sar (student_id),
  INDEX idx_enrollment_no (enrollment_no),
  INDEX idx_microsoft_email (microsoft_email),
  INDEX idx_current_semester (current_semester)
);
`;

// 2. Academic Records Table (Semester-wise 1-8)
const sarAcademicSchema = `
CREATE TABLE IF NOT EXISTS SARacademic (
  academic_id INT AUTO_INCREMENT PRIMARY KEY,
  SAR_id INT NOT NULL,
  semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8) COMMENT 'Semester number 1-8',
  academic_year VARCHAR(20) NULL COMMENT 'e.g., 2024-2025',
  sgpa DECIMAL(4,2) NULL COMMENT 'Semester Grade Point Average',
  cgpa DECIMAL(4,2) NULL COMMENT 'Cumulative Grade Point Average',
  total_credits INT NULL COMMENT 'Total credits for the semester',
  earned_credits INT NULL COMMENT 'Credits earned by student',
  attendance_percentage DECIMAL(5,2) NULL COMMENT 'Attendance percentage for semester',
  subjects JSON NULL COMMENT 'Store subject-wise marks, grades, and credits',
  backlog_count INT DEFAULT 0 COMMENT 'Number of backlogs in this semester',
  semester_result ENUM('pass', 'fail', 'ongoing', 'detained') DEFAULT 'ongoing',
  exam_month VARCHAR(20) NULL COMMENT 'Month of semester exam',
  exam_year YEAR NULL COMMENT 'Year of semester exam',
  remarks TEXT NULL COMMENT 'Additional remarks for the semester',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (SAR_id) REFERENCES Student_SAR(SAR_id) ON DELETE CASCADE,
  UNIQUE KEY unique_semester_sar (SAR_id, semester),
  INDEX idx_semester (semester),
  INDEX idx_academic_year (academic_year),
  INDEX idx_cgpa (cgpa),
  INDEX idx_semester_result (semester_result)
);
`;

// 3. Internships Table
const sarInternshipSchema = `
CREATE TABLE IF NOT EXISTS SARintern (
  internship_id INT AUTO_INCREMENT PRIMARY KEY,
  SAR_id INT NOT NULL,
  company_name VARCHAR(255) NULL COMMENT 'Name of the company/organization',
  position VARCHAR(255) NULL COMMENT 'Position/role during internship',
  internship_type ENUM('summer', 'winter', 'industrial', 'research', 'project', 'freelance', 'other') NULL DEFAULT NULL,
  start_date DATE NULL COMMENT 'Internship start date',
  end_date DATE NULL COMMENT 'Internship end date',
  duration_months INT NULL COMMENT 'Duration in months',
  duration_weeks INT NULL COMMENT 'Duration in weeks (for shorter internships)',
  stipend DECIMAL(10,2) NULL COMMENT 'Stipend amount',
  currency VARCHAR(10) DEFAULT 'INR' COMMENT 'Currency of stipend',
  location VARCHAR(255) NULL COMMENT 'Location of internship',
  work_mode ENUM('onsite', 'remote', 'hybrid') NULL COMMENT 'Work mode during internship',
  description TEXT NULL COMMENT 'Description of work done',
  key_responsibilities TEXT NULL COMMENT 'Key responsibilities handled',
  skills_learned JSON NULL COMMENT 'Array of skills learned during internship',
  technologies_used JSON NULL COMMENT 'Array of technologies/tools used',
  supervisor_name VARCHAR(255) NULL COMMENT 'Name of supervisor/mentor',
  supervisor_designation VARCHAR(255) NULL COMMENT 'Designation of supervisor',
  supervisor_email VARCHAR(255) NULL COMMENT 'Email of supervisor',
  supervisor_phone VARCHAR(20) NULL COMMENT 'Phone of supervisor',
  completion_certificate VARCHAR(500) NULL COMMENT 'File path or URL for completion certificate',
  evaluation_report VARCHAR(500) NULL COMMENT 'File path or URL for evaluation report',
  recommendation_letter VARCHAR(500) NULL COMMENT 'File path or URL for recommendation letter',
  performance_rating ENUM('excellent', 'good', 'average', 'needs_improvement') NULL DEFAULT NULL,
  final_presentation BOOLEAN DEFAULT FALSE COMMENT 'Whether final presentation was given',
  offer_letter_received BOOLEAN DEFAULT FALSE COMMENT 'Whether received job offer',
  status ENUM('applied', 'selected', 'ongoing', 'completed', 'cancelled', 'terminated') DEFAULT 'applied',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (SAR_id) REFERENCES Student_SAR(SAR_id) ON DELETE CASCADE,
  INDEX idx_company (company_name),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_type (internship_type),
  INDEX idx_status (status),
  INDEX idx_work_mode (work_mode)
);
`;

// 4. Achievements Table
const sarAchievementSchema = `
CREATE TABLE IF NOT EXISTS SARAchievements (
  achievement_id INT AUTO_INCREMENT PRIMARY KEY,
  SAR_id INT NOT NULL,
  title VARCHAR(255) NULL COMMENT 'Title of the achievement',
  category ENUM('academic', 'co-curricular', 'sports', 'technical', 'research', 'certification', 'competition', 'project', 'hackathon', 'publication', 'other') NULL DEFAULT NULL,
  subcategory VARCHAR(100) NULL COMMENT 'Specific subcategory within main category',
  description TEXT NULL COMMENT 'Detailed description of achievement',
  achievement_date DATE NULL COMMENT 'Date of achievement',
  event_start_date DATE NULL COMMENT 'Event/competition start date',
  event_end_date DATE NULL COMMENT 'Event/competition end date',
  level ENUM('college', 'university', 'district', 'state', 'national', 'international', 'global') NULL DEFAULT NULL,
  organization VARCHAR(255) NULL COMMENT 'Organizing body/institution',
  event_name VARCHAR(255) NULL COMMENT 'Name of event/competition',
  position_rank VARCHAR(100) NULL COMMENT 'e.g., 1st, 2nd, 3rd, Winner, Runner-up, Participant',
  total_participants INT NULL COMMENT 'Total number of participants',
  team_size INT DEFAULT 1 COMMENT 'Size of team (1 for individual)',
  team_members JSON NULL COMMENT 'Array of team member names if team event',
  prize_amount DECIMAL(10,2) NULL COMMENT 'Prize money received',
  prize_currency VARCHAR(10) DEFAULT 'INR' COMMENT 'Currency of prize money',
  certificate_url VARCHAR(500) NULL COMMENT 'URL/path to certificate',
  trophy_medal_received BOOLEAN DEFAULT FALSE COMMENT 'Whether physical trophy/medal received',
  media_coverage BOOLEAN DEFAULT FALSE COMMENT 'Whether achievement got media coverage',
  media_urls JSON NULL COMMENT 'Array of image/video/news URLs',
  skills_demonstrated JSON NULL COMMENT 'Array of skills demonstrated',
  technologies_used JSON NULL COMMENT 'Technologies used (for technical achievements)',
  verification_status ENUM('pending', 'verified', 'rejected', 'under_review') DEFAULT 'pending',
  verified_by VARCHAR(255) NULL COMMENT 'Admin/Faculty who verified',
  verification_date DATE NULL COMMENT 'Date of verification',
  verification_comments TEXT NULL COMMENT 'Comments from verifier',
  points_awarded INT DEFAULT 0 COMMENT 'Points for grade/ranking calculation',
  impact_score INT NULL COMMENT 'Impact score (1-10) for the achievement',
  tags JSON NULL COMMENT 'Array of tags for easy categorization and search',
  semester_achieved INT NULL CHECK (semester_achieved >= 1 AND semester_achieved <= 8) COMMENT 'Semester during which achieved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (SAR_id) REFERENCES Student_SAR(SAR_id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_date (achievement_date),
  INDEX idx_level (level),
  INDEX idx_verification (verification_status),
  INDEX idx_semester (semester_achieved),
  INDEX idx_organization (organization)
);
`;

module.exports = {
  studentTableSchema,
  studentSARSchema,
  sarAcademicSchema,
  sarInternshipSchema,
  sarAchievementSchema
};
