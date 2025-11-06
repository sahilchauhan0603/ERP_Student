const sendOtpMail = require("../utils/studentOTPMailer");
const sendStatusEmail = require("../utils/sendStatusEmail");
const db = require("../config/db");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const sendRegistrationEmail = require("../utils/registrationEmail");
const { signToken } = require("../utils/jwt");
const rateLimit = require("express-rate-limit");


/* LOGIN & AUTHENTICATION */
const otpStore = {}; // In-memory store for OTPs, consider using Redis or similar in production
// Rate limiter for OTP requests to prevent abuse - 30 min window, max 15 requests
const otpLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  message: { message: "Too many OTP requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
module.exports.otpLimiter = otpLimiter;
// Send OTP to email if student exists - 6-digit OTP, expires in 5 minutes
exports.sendLoginOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  
  // Check for student with regular email or Microsoft email
  const query = `
    SELECT s.*, sar.microsoft_email 
    FROM students s 
    LEFT JOIN Student_SAR sar ON s.id = sar.student_id 
    WHERE s.email = ? OR sar.microsoft_email = ?
  `;
  
  db.query(query, [email, email], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (!results || results.length === 0)
      return res
        .status(404)
        .json({ message: "No student found with this email" });
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    
    try {
      await sendOtpMail(email, otp);
      res.json({ message: "OTP sent to email" });
    } catch (e) {
      res.status(500).json({ message: "Failed to send OTP", error: e });
    }
  });
};
// Verify OTP and issue JWT if valid - 2 hour expiry
exports.verifyLoginOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ message: "No OTP requested for this email" });
  }

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Query the MySQL database for student (check both regular and Microsoft email)
  const query = `
    SELECT s.id, s.email, s.firstName, s.lastName, s.status, sar.microsoft_email 
    FROM students s 
    LEFT JOIN Student_SAR sar ON s.id = sar.student_id 
    WHERE s.email = ? OR sar.microsoft_email = ?
  `;
  
  db.query(query, [email, email], (err, results) => {
    if (err) {
      // MySQL error occurred
      return res
        .status(500)
        .json({ message: "Internal server error during login verification" });
    }

    if (results.length === 0) {
      delete otpStore[email];
      return res
        .status(404)
        .json({ message: "Student not found with this email" });
    }

    const student = results[0];
    delete otpStore[email]; // Clear OTP

    // Issue JWT and set as HTTP-only cookie
    const token = signToken({
      id: student.id,
      email: student.email,
      role: "student",
    });
    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      // sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: true,
      sameSite: "none",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    return res.json({
      message: "Login successful",
      success: true,
      student,
    });
  });
};
// Logout by clearing the token cookie
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ message: "Logged out successfully" });
};


/* DASHBOARD & PROFILE */
// Get student profile by email
exports.getStudentProfile = (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email is required" });
  db.query(
    "SELECT * FROM students WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (!results || results.length === 0)
        return res.status(404).json({ message: "Student not found" });
      const student = results[0];
      res.json({ student });
    }
  );
};
// get student profile by email
exports.getStudentDashboard = (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email is required" });
  db.query(
    "SELECT * FROM students WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (!results || results.length === 0)
        return res.status(404).json({ message: "Student not found" });
      const student = results[0];
      res.json({ student });
    }
  );
};


/* STUDENT REGISTRATION */
// List of all document fields
const docFields = [
  "photo",
  "ipuRegistration",
  "allotmentLetter",
  "examAdmitCard",
  "examScoreCard",
  "marksheet10",
  "passing10",
  "marksheet12",
  "passing12",
  "aadhar",
  "characterCertificate",
  "medicalCertificate",
  "migrationCertificate",
  "categoryCertificate",
  "specialCategoryCertificate",
  "academicFeeReceipt",
  "collegeFeeReceipt",
  "parentSignature",
];
exports.registerStudent = async (req, res) => {
  try {
    // Parse JSON fields for achievements
    let academicAchievements =
      req.body["academicAchievements"] ||
      req.body["academic.achievements"] ||
      req.body["academic.academicAchievements"];
    let coCurricularAchievements =
      req.body["coCurricularAchievements"] ||
      req.body["academic.coCurricularAchievements"];
    if (typeof academicAchievements === "string")
      academicAchievements = JSON.parse(academicAchievements);
    if (typeof coCurricularAchievements === "string")
      coCurricularAchievements = JSON.parse(coCurricularAchievements);

    // Handle file uploads from base64 or buffer (frontend must send base64 or file buffer in req.body)
    const docUrls = {};
    for (const field of docFields) {
      if (req.body[field]) {
        // If base64 string
        const base64Data = req.body[field];
        const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const buffer = Buffer.from(matches[2], "base64");
          const url = await uploadToCloudinary(
            buffer,
            `${field}_${Date.now()}`
          );
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
      course: req.body["personal.course"],
      firstName: req.body["personal.firstName"],
      middleName: req.body["personal.middleName"],
      lastName: req.body["personal.lastName"],
      abcId: req.body["personal.abcId"],
      dob: req.body["personal.dob"],
      placeOfBirth: req.body["personal.placeOfBirth"],
      mobile: req.body["personal.mobile"],
      email: req.body["personal.email"],
      examRoll: req.body["personal.examRoll"],
      examRank: req.body["personal.examRank"],
      gender: req.body["personal.gender"],
      category: req.body["personal.category"],
      subCategory: req.body["personal.subCategory"],
      region: req.body["personal.region"],
      currentAddress: req.body["personal.currentAddress"],
      permanentAddress: req.body["personal.permanentAddress"],
      feeReimbursement: req.body["personal.feeReimbursement"],
      antiRaggingRef: req.body["personal.antiRaggingRef"],
      // Academic
      classX_institute: req.body["academic.classX.institute"],
      classX_board: req.body["academic.classX.board"],
      classX_year: req.body["academic.classX.year"],
      classX_aggregate: req.body["academic.classX.aggregate"],
      classX_pcm: req.body["academic.classX.pcm"],
      classX_isDiplomaOrPolytechnic:
        req.body["academic.classX.isDiplomaOrPolytechnic"],
      classXII_institute: req.body["academic.classXII.institute"],
      classXII_board: req.body["academic.classXII.board"],
      classXII_year: req.body["academic.classXII.year"],
      classXII_aggregate: req.body["academic.classXII.aggregate"],
      classXII_pcm: req.body["academic.classXII.pcm"],
      otherQualification_institute:
        req.body["academic.otherQualification.institute"],
      otherQualification_board: req.body["academic.otherQualification.board"],
      otherQualification_year: req.body["academic.otherQualification.year"],
      otherQualification_aggregate:
        req.body["academic.otherQualification.aggregate"],
      otherQualification_pcm: req.body["academic.otherQualification.pcm"],
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
      father_name: req.body["parents.father.name"],
      father_qualification: req.body["parents.father.qualification"],
      father_occupation: req.body["parents.father.occupation"],
      father_email: req.body["parents.father.email"],
      father_mobile: req.body["parents.father.mobile"],
      father_telephoneSTD: req.body["parents.father.telephoneSTD"],
      father_telephone: req.body["parents.father.telephone"],
      father_officeAddress: req.body["parents.father.officeAddress"],
      mother_name: req.body["parents.mother.name"],
      mother_qualification: req.body["parents.mother.qualification"],
      mother_occupation: req.body["parents.mother.occupation"],
      mother_email: req.body["parents.mother.email"],
      mother_mobile: req.body["parents.mother.mobile"],
      mother_telephoneSTD: req.body["parents.mother.telephoneSTD"],
      mother_telephone: req.body["parents.mother.telephone"],
      mother_officeAddress: req.body["parents.mother.officeAddress"],
      familyIncome: req.body["parents.familyIncome"],
    };

    // Check for duplicate email or abcId
    const duplicateCheckSql =
      "SELECT id FROM students WHERE email = ? OR abcId = ? LIMIT 1";
    db.query(
      duplicateCheckSql,
      [student.email, student.abcId],
      (dupErr, dupResults) => {
        if (dupErr) {
          // Database duplicate check error
          return res
            .status(500)
            .json({ message: "Database error", error: dupErr });
        }
        if (dupResults && dupResults.length > 0) {
          return res.status(400).json({
            message:
              "A user with this email or ABC ID already exists. Please enter a valid email and ABC ID.",
          });
        }

        // Calculate batch based on created_at and course
        function calculateBatch(createdAt, course) {
          const year = new Date(createdAt).getFullYear();
          let endYear;

          // Safety check for course parameter
          if (!course || typeof course !== "string") {
            endYear = year + 4; // Default to 4 years
          } else if (
            course.startsWith("B.Tech") ||
            course.startsWith("LE-B.Tech")
          ) {
            endYear = year + 4;
          } else if (course === "BBA" || course === "MBA") {
            endYear = year + 3;
          } else {
            endYear = year + 3;
          }
          return `${year}-${endYear}`;
        }

        // Use current date for created_at (will match DB default)
        const createdAt = new Date();
        student.batch = calculateBatch(createdAt, student.course);
        student.created_at = createdAt;

        // Insert into DB

        const sql = "INSERT INTO students SET ?";
        db.query(sql, student, async (err, result) => {
          if (err) {
            // Database insert error
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }

          // Send confirmation email to the student
          try {
            const studentName = `${student.firstName} ${student.lastName}`;
            
            const emailSent = await sendRegistrationEmail(
              student.email,
              studentName,
              result.insertId
            );

            if (!emailSent) {
              console.error(`Failed to send registration email to ${student.email}`);
            }
          } catch (emailError) {
            console.error('Registration email error:', emailError);
            // Don't fail the registration if email fails
          }

          res.status(201).json({
            success: true,
            message: "Student registered successfully",
            studentId: result.insertId,
          });
        });
      }
    );
  } catch (error) {
    // Register student error
    res.status(500).json({ message: "Server error", error });
  }
};
// Helper to normalize declined field names to full paths
function normalizeDeclinedField(field) {
  // Personal fields
  const personalFields = [
    "firstName",
    "middleName",
    "lastName",
    "email",
    "mobile",
    "dob",
    "placeOfBirth",
    "gender",
    "category",
    "subCategory",
    "region",
    "currentAddress",
    "permanentAddress",
    "course",
    "examRoll",
    "examRank",
    "abcId",
    "feeReimbursement",
    "antiRaggingRef",
    "status",
    "created_at",
  ];
  if (personalFields.includes(field)) return `personal.${field}`;
  // Parent fields
  if (field.startsWith("father_"))
    return `parent.father.${field.replace("father_", "")}`;
  if (field.startsWith("mother_"))
    return `parent.mother.${field.replace("mother_", "")}`;
  if (field === "familyIncome") return "parent.familyIncome";
  // Academic fields (not usually declined, but for completeness)
  if (field.startsWith("classX_"))
    return `academic.classX.${field.replace("classX_", "")}`;
  if (field.startsWith("classXII_"))
    return `academic.classXII.${field.replace("classXII_", "")}`;
  if (field.startsWith("otherQualification_"))
    return `academic.otherQualification.${field.replace(
      "otherQualification_",
      ""
    )}`;
  // Document fields
  const docFields = [
    "photo",
    "ipuRegistration",
    "allotmentLetter",
    "examAdmitCard",
    "examScoreCard",
    "marksheet10",
    "passing10",
    "marksheet12",
    "passing12",
    "aadhar",
    "characterCertificate",
    "medicalCertificate",
    "migrationCertificate",
    "categoryCertificate",
    "specialCategoryCertificate",
    "academicFeeReceipt",
    "collegeFeeReceipt",
    "parentSignature",
  ];
  if (docFields.includes(field)) return `documents.${field}`;
  // Fallback: return as is
  return field;
}
// Helper to flatten nested objects to dot-notated keys
function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !Array.isArray(obj[k]) &&
      !(obj[k] instanceof Buffer)
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}
// Helper to map dot-notated keys to flat MySQL column names
function mapToColumn(key) {
  // Personal fields
  if (key.startsWith("personal.")) return key.replace("personal.", "");
  // Parent fields
  if (key.startsWith("parent.father."))
    return "father_" + key.replace("parent.father.", "");
  if (key.startsWith("parent.mother."))
    return "mother_" + key.replace("parent.mother.", "");
  if (key === "parent.familyIncome") return "familyIncome";
  // Academic fields
  if (key.startsWith("academic.classX."))
    return "classX_" + key.replace("academic.classX.", "");
  if (key.startsWith("academic.classXII."))
    return "classXII_" + key.replace("academic.classXII.", "");
  if (key.startsWith("academic.otherQualification."))
    return (
      "otherQualification_" + key.replace("academic.otherQualification.", "")
    );
  // Document fields
  if (key.startsWith("documents.")) return key.replace("documents.", "");
  // Fallback
  return key;
}
// Helper to format ISO date strings to YYYY-MM-DD
function formatDateToYMD(val) {
  if (!val) return null;
  // If already in YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // Try to parse and format
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toISOString().slice(0, 10);
}


/* GET /student/:studentId - Get complete student details by ID */
// Handler to fetch complete student details by ID
exports.getStudentDetailsById = (req, res) => {
  res.set("Cache-Control", "no-store"); // Prevent caching
  const { studentId } = req.params;

  // Only allow access if the logged-in user matches the requested studentId
  if (
    !req.user ||
    req.user.role !== "student" ||
    String(req.user.id) !== String(studentId)
  ) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only access your own dashboard." });
  }

  if (!studentId) {
    return res.status(400).json({ message: "studentId required" });
  }

  db.query(
    "SELECT * FROM students WHERE id = ?",
    [studentId],
    (err, results) => {
      if (err) {
        // Database error
        return res.status(500).json({ message: "Database error" });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const student = results[0];

      // Parse JSON fields safely
      let academicAchievements = student.academicAchievements;
      let coCurricularAchievements = student.coCurricularAchievements;
      let declinedFields = student.declinedFields;

      try {
        if (typeof academicAchievements === "string") {
          academicAchievements = JSON.parse(academicAchievements);
        }
      } catch (e) {
        // Failed to parse academicAchievements JSON
        academicAchievements = [];
      }

      try {
        if (typeof coCurricularAchievements === "string") {
          coCurricularAchievements = JSON.parse(coCurricularAchievements);
        }
      } catch (e) {
        // Failed to parse coCurricularAchievements JSON
        coCurricularAchievements = [];
      }

      try {
        if (typeof declinedFields === "string") {
          declinedFields = JSON.parse(declinedFields);
        }
        if (Array.isArray(declinedFields)) {
          declinedFields = declinedFields.map(normalizeDeclinedField);
        }
      } catch (e) {
        // Failed to parse declinedFields JSON
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
        created_at: student.created_at,
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
          officeAddress: student.father_officeAddress,
        },
        mother: {
          name: student.mother_name,
          qualification: student.mother_qualification,
          occupation: student.mother_occupation,
          email: student.mother_email,
          mobile: student.mother_mobile,
          telephoneSTD: student.mother_telephoneSTD,
          telephone: student.mother_telephone,
          officeAddress: student.mother_officeAddress,
        },
        familyIncome: student.familyIncome,
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
        parentSignature: student.parentSignature,
      };

      // Academic Information
      const academic = {
        classX: {
          institute: student.classX_institute || "",
          board: student.classX_board || "",
          year: student.classX_year || "",
          aggregate: student.classX_aggregate || "",
          pcm: student.classX_pcm || "",
          isDiplomaOrPolytechnic: student.classX_isDiplomaOrPolytechnic || "",
        },
        classXII: {
          institute: student.classXII_institute || "",
          board: student.classXII_board || "",
          year: student.classXII_year || "",
          aggregate: student.classXII_aggregate || "",
          pcm: student.classXII_pcm || "",
        },
        otherQualification: {
          institute: student.otherQualification_institute || "",
          board: student.otherQualification_board || "",
          year: student.otherQualification_year || "",
          aggregate: student.otherQualification_aggregate || "",
          pcm: student.otherQualification_pcm || "",
        },
        academicAchievements: academicAchievements || [],
        coCurricularAchievements: coCurricularAchievements || [],
      };

      // ✅ Add declinedFields in the response
      res.json({
        success: true,
        data: {
          personal,
          parent,
          documents,
          academic,
          declinedFields,
        },
      });
    }
  );
};
/* GET /student/me - Get logged-in student's full details */
// Handler to fetch complete student details for logged-in student
exports.getStudentDetailsMe = (req, res) => {
  res.set("Cache-Control", "no-store"); // Prevent caching
  const studentId = req.user && req.user.id;

  if (!studentId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No student ID in token." });
  }
  db.query(
    "SELECT * FROM students WHERE id = ?",
    [studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (!results || results.length === 0)
        return res.status(404).json({ message: "Student not found" });
      const student = results[0];

      // Parse JSON fields safely
      let academicAchievements = student.academicAchievements;
      let coCurricularAchievements = student.coCurricularAchievements;
      let declinedFields = student.declinedFields;
      try {
        if (typeof academicAchievements === "string")
          academicAchievements = JSON.parse(academicAchievements);
      } catch (e) {
        academicAchievements = [];
      }
      try {
        if (typeof coCurricularAchievements === "string")
          coCurricularAchievements = JSON.parse(coCurricularAchievements);
      } catch (e) {
        coCurricularAchievements = [];
      }
      try {
        if (typeof declinedFields === "string")
          declinedFields = JSON.parse(declinedFields);
        if (Array.isArray(declinedFields))
          declinedFields = declinedFields.map(normalizeDeclinedField);
      } catch (e) {
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
        created_at: student.created_at,
        batch: student.batch,
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
          officeAddress: student.father_officeAddress,
        },
        mother: {
          name: student.mother_name,
          qualification: student.mother_qualification,
          occupation: student.mother_occupation,
          email: student.mother_email,
          mobile: student.mother_mobile,
          telephoneSTD: student.mother_telephoneSTD,
          telephone: student.mother_telephone,
          officeAddress: student.mother_officeAddress,
        },
        familyIncome: student.familyIncome,
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
        parentSignature: student.parentSignature,
      };
      // Academic Information
      const academic = {
        classX: {
          institute: student.classX_institute || "",
          board: student.classX_board || "",
          year: student.classX_year || "",
          aggregate: student.classX_aggregate || "",
          pcm: student.classX_pcm || "",
          isDiplomaOrPolytechnic: student.classX_isDiplomaOrPolytechnic || "",
        },
        classXII: {
          institute: student.classXII_institute || "",
          board: student.classXII_board || "",
          year: student.classXII_year || "",
          aggregate: student.classXII_aggregate || "",
          pcm: student.classXII_pcm || "",
        },
        otherQualification: {
          institute: student.otherQualification_institute || "",
          board: student.otherQualification_board || "",
          year: student.otherQualification_year || "",
          aggregate: student.otherQualification_aggregate || "",
          pcm: student.otherQualification_pcm || "",
        },
        academicAchievements: academicAchievements || [],
        coCurricularAchievements: coCurricularAchievements || [],
      };
      res.json({
        success: true,
        data: {
          personal,
          parent,
          documents,
          academic,
          declinedFields,
        },
      });
    }
  );
};


/* PUT /student/declined - Update only declined fields for logged-in student */
// update declined fields
exports.updateDeclinedFields = async (req, res) => {
  const studentId = req.user && req.user.id;
  let data;
  // Support both JSON and multipart/form-data
  if (req.is("multipart/form-data")) {
    try {
      data = JSON.parse(req.body.data);
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid data format" });
    }
  } else {
    data = req.body.data;
  }

  if (!data || Object.keys(data).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No data provided" });
  }

  // Step 1: Fetch declinedFields and status from DB
  const getDeclinedSql =
    "SELECT declinedFields, status FROM students WHERE id = ?";
  db.query(getDeclinedSql, [studentId], async (err, results) => {
    if (err) {
      // Error fetching declinedFields
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    let declinedFields = results[0].declinedFields
      ? JSON.parse(results[0].declinedFields)
      : [];
    if (Array.isArray(declinedFields)) {
      declinedFields = declinedFields.map(normalizeDeclinedField);
    }

    const status = results[0].status;

    // 2. Only allow updates if student is 'declined'
    if (status !== "declined") {
      return res.status(403).json({
        success: false,
        message: "Only declined profiles can be edited",
      });
    }

    // Ensure data.documents exists
    if (!data.documents) data.documents = {};

    // Handle file uploads (if any)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const field = file.fieldname;

        // Check if this is a document field and if it's in declined fields
        if (field.startsWith("documents.") && declinedFields.includes(field)) {
          const docField = field.replace("documents.", "");
          // Upload to Cloudinary
          try {
            const url = await uploadToCloudinary(
              file.buffer,
              `${docField}_${Date.now()}_${file.originalname}`
            );
            data.documents[docField] = url;
          } catch (e) {
            // Failed to upload field
            return res.status(500).json({
              success: false,
              message: `Failed to upload ${docField}: ${e.message}`,
            });
          }
        }
      }
    }

    // Now flatten data after processing files
    const flatData = flattenObject(data);
    // console.log("Declined fields:", declinedFields);
    // console.log("Flattened data keys:", Object.keys(flatData));
    // console.log("Data documents:", data.documents);

    const updatableFields = Object.keys(flatData).filter((field) =>
      declinedFields.includes(normalizeDeclinedField(field))
    );
    // console.log("Updatable fields:", updatableFields);

    if (updatableFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No declined fields specified for update",
        debug: {
          declinedFields,
          flatDataKeys: Object.keys(flatData),
          dataDocuments: data.documents,
        },
      });
    }

    // Prepare updates for SQL
    const updates = [];
    const values = [];
    for (const field of updatableFields) {
      const column = mapToColumn(field);
      let value = flatData[field];
      // Format date fields
      if (column === "dob") {
        value = formatDateToYMD(value);
      }
      updates.push(`${column} = ?`);
      values.push(value);
    }

    // Also, mark status as 'pending' and update declinedFields
    const updatedDeclinedFields = declinedFields.filter(
      (f) => !updatableFields.includes(f)
    );
    updates.push("status = ?");
    values.push("pending");
    updates.push("declinedFields = ?");
    values.push(JSON.stringify(updatedDeclinedFields));
    values.push(studentId); // for WHERE clause

    const sql = `UPDATE students SET ${updates.join(", ")} WHERE id = ?`;

    db.query(sql, values, (err2, result2) => {
      if (err2) {
        // Error updating declined fields
        return res.status(500).json({
          success: false,
          message: "Failed to update declined fields",
        });
      }

      // Send email to student notifying profile update and resubmission
      db.query(
        "SELECT email, firstName, lastName FROM students WHERE id = ?",
        [studentId],
        (err3, studentRows) => {
          if (!err3 && studentRows && studentRows.length > 0) {
            const { email, firstName, lastName } = studentRows[0];
            const fullName = `${firstName} ${lastName}`;
            const emailSubject = "Profile Update Submitted for Review";
            const emailHtml = `
            <div style=\"max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f9f9f9;\">
              <div style=\"text-align:center;padding:20px 0;background:#2563eb;color:white;\">
                <h1>Profile Update Submitted</h1>
              </div>
              <div style=\"padding:20px;background:white;\">
                <p>Dear ${fullName},</p>
                <p>Your profile has been updated and resubmitted for review by the authorities.</p>
                <p>Our team will review your changes and notify you once a decision has been made.</p>
                <div style=\"background:#f0f8ff;padding:15px;margin:20px 0;border-left:4px solid #2563eb;\">
                  <p style=\"margin:0;\">Thank you for keeping your information up to date.</p>
                </div>
                <p>Stay tuned for further updates.</p>
                <p>Best regards,<br>The Admissions Team</p>
              </div>
              <div style=\"text-align:center;padding:20px;font-size:12px;color:#777;\">
                <p>© ${new Date().getFullYear()} Bhagwan Parshuram Institute of Technology</p>
              </div>
            </div>
          `;
            sendStatusEmail(email, emailSubject, emailHtml).catch(() => {});
          }
        }
      );

      // Fetch updated student data to return the new document URLs
      db.query(
        "SELECT * FROM students WHERE id = ?",
        [studentId],
        (err4, updatedStudent) => {
          if (err4) {
            return res.json({
              success: true,
              message:
                "Declined fields updated, profile marked pending for review",
              updatedFields: updatableFields,
              declinedFields: updatedDeclinedFields,
            });
          }

          const studentData = updatedStudent[0];
          return res.json({
            success: true,
            message:
              "Declined fields updated, profile marked pending for review",
            updatedFields: updatableFields,
            declinedFields: updatedDeclinedFields,
            updatedData: studentData, // Include the updated student data with Cloudinary URLs
          });
        }
      );
    });
  });
};


/* GET /student/check-email?email= - Check if email exists */
// Real-time uniqueness check endpoints
exports.checkEmailExists = (req, res) => {
  const { email } = req.query;
  if (!email)
    return res
      .status(400)
      .json({ exists: false, message: "Email is required" });
  db.query(
    "SELECT id FROM students WHERE email = ?",
    [email],
    (err, results) => {
      if (err)
        return res.status(500).json({ exists: false, message: "DB error" });
      res.json({ exists: results.length > 0 });
    }
  );
};
exports.checkAbcIdExists = (req, res) => {
  const { abcId } = req.query;
  if (!abcId)
    return res
      .status(400)
      .json({ exists: false, message: "ABC ID is required" });
  db.query(
    "SELECT id FROM students WHERE abcId = ?",
    [abcId],
    (err, results) => {
      if (err)
        return res.status(500).json({ exists: false, message: "DB error" });
      res.json({ exists: results.length > 0 });
    }
  );
};


/* GET /stats - Public statistics for homepage */
// Get public statistics for homepage
exports.getPublicStats = (req, res) => {
  const queries = [
    "SELECT COUNT(*) as total FROM students",
    "SELECT COUNT(*) as pending FROM students WHERE status = 'pending'",
    "SELECT COUNT(*) as approved FROM students WHERE status = 'approved'",
  ];

  Promise.all(
    queries.map(
      (query) =>
        new Promise((resolve, reject) => {
          db.query(query, (err, results) => {
            if (err) reject(err);
            else resolve(results[0]);
          });
        })
    )
  )
    .then((results) => {
      res.json({
        success: true,
        total:
          results[0].total || results[0].pending || results[0].approved || 0,
        pending:
          results[1].pending || results[1].total || results[1].approved || 0,
        approved:
          results[2].approved || results[2].total || results[2].pending || 0,
      });
    })
    .catch((error) => {
      console.error("Stats query error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch statistics",
        error: error.message,
      });
    });
};
