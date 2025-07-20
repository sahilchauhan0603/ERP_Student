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
  mobile VARCHAR(20),
  email VARCHAR(100),
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

module.exports = studentTableSchema;
