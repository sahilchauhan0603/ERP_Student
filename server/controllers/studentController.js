const sendOtpMail = require('../utils/studentOTPMailer');
// const sendStatusEmail = require('../utils/sendStatusEmail');
// const crypto = require('crypto');
const db = require('../config/db');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const otpStore = {}; // In-memory store for OTPs, consider using Redis or similar in production
const { signToken } = require('../utils/jwt');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many OTP requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
module.exports.otpLimiter = otpLimiter;

// const Student = require('../modals/student');

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

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP required' });
  }

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ message: 'No OTP requested for this email' });
  }

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Query the MySQL database for student
  const query = 'SELECT id, email, firstName, lastName, status FROM students WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('❌ MySQL error:', err);
      return res.status(500).json({ message: 'Internal server error during login verification' });
    }

    if (results.length === 0) {
      delete otpStore[email];
      return res.status(404).json({ message: 'Student not found with this email' });
    }

    const student = results[0];
    delete otpStore[email]; // Clear OTP

    // Issue JWT and set as HTTP-only cookie
    const token = signToken({ id: student.id, email: student.email, role: 'student' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 2 * 60 * 60 * 1000 // 2 hours
    });

    return res.json({
      message: 'Login successful',
      success: true,
      student,
    });
  });
};

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


// Handler to fetch complete student details by ID
exports.getStudentDetailsById = (req, res) => {
  const { studentId } = req.params;

  // Only allow access if the logged-in user matches the requested studentId
  if (!req.user || req.user.role !== 'student' || String(req.user.id) !== String(studentId)) {
    return res.status(403).json({ message: 'Forbidden: You can only access your own dashboard.' });
  }

  if (!studentId) {
    return res.status(400).json({ message: 'studentId required' });
  }

  db.query('SELECT * FROM students WHERE id = ?', [studentId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = results[0];

    // Parse JSON fields safely
    let academicAchievements = student.academicAchievements;
    let coCurricularAchievements = student.coCurricularAchievements;
    let declinedFields = student.declinedFields;

    try {
      if (typeof academicAchievements === 'string') {
        academicAchievements = JSON.parse(academicAchievements);
      }
    } catch (e) {
      console.warn('Failed to parse academicAchievements JSON:', e);
      academicAchievements = [];
    }

    try {
      if (typeof coCurricularAchievements === 'string') {
        coCurricularAchievements = JSON.parse(coCurricularAchievements);
      }
    } catch (e) {
      console.warn('Failed to parse coCurricularAchievements JSON:', e);
      coCurricularAchievements = [];
    }

    try {
      if (typeof declinedFields === 'string') {
        declinedFields = JSON.parse(declinedFields);
      }
    } catch (e) {
      console.warn('Failed to parse declinedFields JSON:', e);
      declinedFields = [];
    }

    // Personal Information
    const personal = {
      id: student.id,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      email: student.email,
      mobile: student.mobile,
      dob: student.dob,
      placeOfBirth: student.placeOfBirth,
      gender: student.gender,
      category: student.category,
      subCategory: student.subCategory,
      region: student.region,
      currentAddress: student.currentAddress,
      permanentAddress: student.permanentAddress,
      course: student.course,
      examRoll: student.examRoll,
      examRank: student.examRank,
      abcId: student.abcId,
      feeReimbursement: student.feeReimbursement,
      antiRaggingRef: student.antiRaggingRef,
      status: student.status,
      created_at: student.created_at
    };

    // Parent Information
    const parent = {
      father: {
        name: student.father_name,
        qualification: student.father_qualification,
        occupation: student.father_occupation,
        email: student.father_email,
        mobile: student.father_mobile,
        telephoneSTD: student.father_telephoneSTD,
        telephone: student.father_telephone,
        officeAddress: student.father_officeAddress
      },
      mother: {
        name: student.mother_name,
        qualification: student.mother_qualification,
        occupation: student.mother_occupation,
        email: student.mother_email,
        mobile: student.mother_mobile,
        telephoneSTD: student.mother_telephoneSTD,
        telephone: student.mother_telephone,
        officeAddress: student.mother_officeAddress
      },
      familyIncome: student.familyIncome
    };

    // Documents
    const documents = {
      photo: student.photo,
      ipuRegistration: student.ipuRegistration,
      allotmentLetter: student.allotmentLetter,
      examAdmitCard: student.examAdmitCard,
      examScoreCard: student.examScoreCard,
      marksheet10: student.marksheet10,
      passing10: student.passing10,
      marksheet12: student.marksheet12,
      passing12: student.passing12,
      aadhar: student.aadhar,
      characterCertificate: student.characterCertificate,
      medicalCertificate: student.medicalCertificate,
      migrationCertificate: student.migrationCertificate,
      categoryCertificate: student.categoryCertificate,
      specialCategoryCertificate: student.specialCategoryCertificate,
      academicFeeReceipt: student.academicFeeReceipt,
      collegeFeeReceipt: student.collegeFeeReceipt,
      parentSignature: student.parentSignature
    };

    // Academic Information
    const academic = {
      classX: {
        institute: student.classX_institute || '',
        board: student.classX_board || '',
        year: student.classX_year || '',
        aggregate: student.classX_aggregate || '',
        pcm: student.classX_pcm || '',
        isDiplomaOrPolytechnic: student.classX_isDiplomaOrPolytechnic || ''
      },
      classXII: {
        institute: student.classXII_institute || '',
        board: student.classXII_board || '',
        year: student.classXII_year || '',
        aggregate: student.classXII_aggregate || '',
        pcm: student.classXII_pcm || ''
      },
      otherQualification: {
        institute: student.otherQualification_institute || '',
        board: student.otherQualification_board || '',
        year: student.otherQualification_year || '',
        aggregate: student.otherQualification_aggregate || '',
        pcm: student.otherQualification_pcm || ''
      },
      academicAchievements: academicAchievements || [],
      coCurricularAchievements: coCurricularAchievements || []
    };

    // ✅ Add declinedFields in the response
    res.json({
      success: true,
      data: {
        personal,
        parent,
        documents,
        academic,
        declinedFields
      }
    });
  });
};



// PATCH /student/students/:id/update-declined
exports.updateDeclinedFields = (req, res) => {
  const studentId = req.params.id;
  const { data } = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, message: 'No data provided' });
  }

  // Step 1: Fetch declinedFields and status from DB
  const getDeclinedSql =
    'SELECT declinedFields, status FROM students WHERE id = ?';
  db.query(getDeclinedSql, [studentId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching declinedFields:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const declinedFields = results[0].declinedFields 
      ? JSON.parse(results[0].declinedFields)
      : [];

    const status = results[0].status;

    // 2. Only allow updates if student is 'declined'
    if (status !== 'declined') {
      return res.status(403).json({
        success: false,
        message: 'Only declined profiles can be edited'
      });
    }

    // 3. Only allow updates to declined fields
    const updatableFields = Object.keys(data).filter(field => declinedFields.includes(field));
    if (updatableFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No declined fields specified for update',
      });
    }

    const updates = updatableFields.map(field => `${field} = ?`).join(', ');

    const values = updatableFields.map(field => data[field]);

    // Also, mark status as 'pending' and update declinedFields
    // Remove updated fields from declinedFields
    const updatedDeclinedFields = declinedFields.filter(f => !updatableFields.includes(f));
    values.push('pending'); // new status
    values.push(JSON.stringify(updatedDeclinedFields)); // new declinedFields
    values.push(studentId); // for WHERE clause

    const sql = `UPDATE students SET ${updates}, status = ?, declinedFields = ? WHERE id = ?`;

    db.query(sql, values, (err2, result2) => {
      if (err2) {
        console.error('❌ Error updating declined fields:', err2);
        return res.status(500).json({ success: false, message: 'Failed to update declined fields' });
      }

      return res.json({
        success: true,
        message: 'Declined fields updated, profile marked pending for review',
        updatedFields: updatableFields,
        declinedFields: updatedDeclinedFields
      });
    });
  });
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
};
