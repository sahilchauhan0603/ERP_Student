const sendOtpMail = require('../utils/otpMailer');
const crypto = require('crypto');
// In-memory OTP store (for demo; use Redis or DB in production)
const otpStore = {};

// Send OTP to email if student exists
exports.sendLoginOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  db.query('SELECT * FROM students WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (!results || results.length === 0) return res.status(404).json({ message: 'No student found with this email' });
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    try {
      await sendOtpMail(email, otp);
      res.json({ message: 'OTP sent to email' });
    } catch (e) {
      res.status(500).json({ message: 'Failed to send OTP', error: e });
    }
  });
};

// --- Student Profile ---
exports.getStudentProfile = (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  db.query('SELECT * FROM students WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Student not found' });
    const student = results[0];
    res.json({ student });
  });
};

// --- Student Dashboard ---
exports.getStudentDashboard = (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  db.query('SELECT * FROM students WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Student not found' });
    const student = results[0];
    res.json({ student });
  });
};

// Verify OTP and "login"
exports.verifyLoginOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: 'No OTP requested for this email' });
  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  delete otpStore[email];
  // Optionally, create a session or JWT here
  res.json({ message: 'Login successful' });
};

const db = require('../config/db');
const uploadToCloudinary = require('../utils/cloudinaryUpload');

// List of all document fields
const docFields = [
  'photo', 'ipuRegistration', 'allotmentLetter', 'examAdmitCard', 'examScoreCard',
  'marksheet10', 'passing10', 'marksheet12', 'passing12', 'aadhar', 'characterCertificate',
  'medicalCertificate', 'migrationCertificate', 'categoryCertificate', 'specialCategoryCertificate',
  'academicFeeReceipt', 'collegeFeeReceipt', 'parentSignature'
];

exports.registerStudent = async (req, res) => {
  try {
    // Parse JSON fields for achievements
    let academicAchievements = req.body['academicAchievements'] || req.body['academic.achievements'] || req.body['academic.academicAchievements'];
    let coCurricularAchievements = req.body['coCurricularAchievements'] || req.body['academic.coCurricularAchievements'];
    if (typeof academicAchievements === 'string') academicAchievements = JSON.parse(academicAchievements);
    if (typeof coCurricularAchievements === 'string') coCurricularAchievements = JSON.parse(coCurricularAchievements);

    // Handle file uploads from base64 or buffer (frontend must send base64 or file buffer in req.body)
    const docUrls = {};
    for (const field of docFields) {
      if (req.body[field]) {
        // If base64 string
        const base64Data = req.body[field];
        const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const buffer = Buffer.from(matches[2], 'base64');
          const url = await uploadToCloudinary(buffer, `${field}_${Date.now()}`);
          docUrls[field] = url;
        } else {
          docUrls[field] = null;
        }
      } else {
        docUrls[field] = null;
      }
    }

    // Build student object from form fields
    const student = {
      // Personal
      course: req.body['personal.course'],
      firstName: req.body['personal.firstName'],
      middleName: req.body['personal.middleName'],
      lastName: req.body['personal.lastName'],
      abcId: req.body['personal.abcId'],
      dob: req.body['personal.dob'],
      placeOfBirth: req.body['personal.placeOfBirth'],
      mobile: req.body['personal.mobile'],
      email: req.body['personal.email'],
      examRoll: req.body['personal.examRoll'],
      examRank: req.body['personal.examRank'],
      gender: req.body['personal.gender'],
      category: req.body['personal.category'],
      subCategory: req.body['personal.subCategory'],
      region: req.body['personal.region'],
      currentAddress: req.body['personal.currentAddress'],
      permanentAddress: req.body['personal.permanentAddress'],
      feeReimbursement: req.body['personal.feeReimbursement'],
      antiRaggingRef: req.body['personal.antiRaggingRef'],
      // Academic
      classX_institute: req.body['academic.classX.institute'],
      classX_board: req.body['academic.classX.board'],
      classX_year: req.body['academic.classX.year'],
      classX_aggregate: req.body['academic.classX.aggregate'],
      classX_pcm: req.body['academic.classX.pcm'],
      classX_isDiplomaOrPolytechnic: req.body['academic.classX.isDiplomaOrPolytechnic'],
      classXII_institute: req.body['academic.classXII.institute'],
      classXII_board: req.body['academic.classXII.board'],
      classXII_year: req.body['academic.classXII.year'],
      classXII_aggregate: req.body['academic.classXII.aggregate'],
      classXII_pcm: req.body['academic.classXII.pcm'],
      otherQualification_institute: req.body['academic.otherQualification.institute'],
      otherQualification_board: req.body['academic.otherQualification.board'],
      otherQualification_year: req.body['academic.otherQualification.year'],
      otherQualification_aggregate: req.body['academic.otherQualification.aggregate'],
      otherQualification_pcm: req.body['academic.otherQualification.pcm'],
      academicAchievements: JSON.stringify(academicAchievements || []),
      coCurricularAchievements: JSON.stringify(coCurricularAchievements || []),
      // Documents (Cloudinary URLs)
      photo: docUrls.photo,
      ipuRegistration: docUrls.ipuRegistration,
      allotmentLetter: docUrls.allotmentLetter,
      examAdmitCard: docUrls.examAdmitCard,
      examScoreCard: docUrls.examScoreCard,
      marksheet10: docUrls.marksheet10,
      passing10: docUrls.passing10,
      marksheet12: docUrls.marksheet12,
      passing12: docUrls.passing12,
      aadhar: docUrls.aadhar,
      characterCertificate: docUrls.characterCertificate,
      medicalCertificate: docUrls.medicalCertificate,
      migrationCertificate: docUrls.migrationCertificate,
      categoryCertificate: docUrls.categoryCertificate,
      specialCategoryCertificate: docUrls.specialCategoryCertificate,
      academicFeeReceipt: docUrls.academicFeeReceipt,
      collegeFeeReceipt: docUrls.collegeFeeReceipt,
      parentSignature: docUrls.parentSignature,
      // Parents
      father_name: req.body['parents.father.name'],
      father_qualification: req.body['parents.father.qualification'],
      father_occupation: req.body['parents.father.occupation'],
      father_email: req.body['parents.father.email'],
      father_mobile: req.body['parents.father.mobile'],
      father_telephoneSTD: req.body['parents.father.telephoneSTD'],
      father_telephone: req.body['parents.father.telephone'],
      father_officeAddress: req.body['parents.father.officeAddress'],
      mother_name: req.body['parents.mother.name'],
      mother_qualification: req.body['parents.mother.qualification'],
      mother_occupation: req.body['parents.mother.occupation'],
      mother_email: req.body['parents.mother.email'],
      mother_mobile: req.body['parents.mother.mobile'],
      mother_telephoneSTD: req.body['parents.mother.telephoneSTD'],
      mother_telephone: req.body['parents.mother.telephone'],
      mother_officeAddress: req.body['parents.mother.officeAddress'],
      familyIncome: req.body['parents.familyIncome'],
    };

    // Insert into DB
    const sql = 'INSERT INTO students SET ?';
    db.query(sql, student, (err, result) => {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.status(201).json({ message: 'Student registered successfully', studentId: result.insertId });
    });
  } catch (error) {
    console.error('Register Student Error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
