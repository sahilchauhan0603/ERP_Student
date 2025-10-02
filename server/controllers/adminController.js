const sendStatusEmail = require("../utils/sendStatusEmail");
const adminOTPMailer = require("../utils/adminOTPMailer");
const { signToken } = require("../utils/jwt");
const db = require("../config/db");

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
const rateLimit = require("express-rate-limit");


/* ADMIN AUTH CONTROLLER */
// Rate limiter for OTP requests - max 15 requests per 30 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  message: { message: "Too many OTP requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
module.exports.otpLimiter = otpLimiter;

const adminOtpStore = {}; // In-memory store for OTPs (for demo purposes only)
// Sending OTP to admin email
// how this works
// 1. Admin sends email to /admin/send-otp
// 2. If email is in ADMIN_EMAILS, generate OTP, store in adminOtpStore with expiry, send email
// 3. Admin sends email+OTP to /admin/verify-otp
// 4. If OTP matches and not expired, issue JWT and set as HTTP-only cookie
// 5. Admin can access protected routes with JWT in cookie
// 6. Admin can logout which clears the cookie
// Note: In production, use a persistent store like Redis for OTPs and implement better security measures like rate limiting, IP checks, etc.
exports.sendAdminOtp = async (req, res) => {
  const { email } = req.body;

  if (!email || !ADMIN_EMAILS.includes(email)) {
    return res.status(401).json({ message: "Unauthorized email" });
  }
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  adminOtpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  try {
    await adminOTPMailer(email, otp);
    // await sendOtpMail(email, otp);
    res.json({ message: "OTP sent to email" });
  } catch (e) {
    res.status(500).json({ message: "Failed to send OTP", error: e });
  }
};
// Verify OTP and issue JWT
exports.verifyAdminOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP required" });
  const record = adminOtpStore[email];
  if (!record)
    return res.status(400).json({ message: "No OTP requested for this email" });
  if (Date.now() > record.expires) {
    delete adminOtpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }
  if (record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });
  delete adminOtpStore[email];
  // Issue JWT and set as HTTP-only cookie
  const token = signToken({ email, role: "admin" });
  res.cookie("token", token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    // sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: true,
    sameSite: "none",
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });
  res.json({ message: "Login successful" });
};
// Admin logout
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ message: "Logged out successfully" });
};


/* ADMIN DASHBOARD CONTROLLERS */
// Get overall student statistics
exports.getStudentStats = (req, res) => {
  const stats = {};
  db.query("SELECT COUNT(*) as total FROM students", (err, totalResult) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    stats.total = totalResult[0].total;
    db.query(
      "SELECT COUNT(*) as pending FROM students WHERE status = 'pending'",
      (err2, pendingResult) => {
        if (err2)
          return res.status(500).json({ message: "DB error", error: err2 });
        stats.pending = pendingResult[0].pending;
        db.query(
          "SELECT COUNT(*) as approved FROM students WHERE status = 'approved'",
          (err3, approvedResult) => {
            if (err3)
              return res.status(500).json({ message: "DB error", error: err3 });
            stats.approved = approvedResult[0].approved;
            db.query(
              "SELECT COUNT(*) as declined FROM students WHERE status = 'declined'",
              (err4, declinedResult) => {
                if (err4)
                  return res
                    .status(500)
                    .json({ message: "DB error", error: err4 });
                stats.declined = declinedResult[0].declined;
                res.json(stats);
              }
            );
          }
        );
      }
    );
  });
};
// Get batch-wise student statistics
exports.getBatchStats = (req, res) => {
  const query = `
    SELECT 
      YEAR(created_at) as batch_year,
      COUNT(*) as student_count
    FROM students 
    WHERE created_at IS NOT NULL
    GROUP BY YEAR(created_at)
    ORDER BY batch_year DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB error", error: err });
    }
    res.json(results);
  });
};
// Get branch-wise student statistics within a specific batch
exports.getBranchStats = (req, res) => {
  const { batchYear } = req.query;

  let query = `
    SELECT 
      course as branch,
      COUNT(*) as student_count
    FROM students 
    WHERE course IS NOT NULL AND course != ''
  `;

  const params = [];
  if (batchYear) {
    query += ` AND YEAR(created_at) = ?`;
    params.push(batchYear);
  }

  query += ` GROUP BY course ORDER BY student_count DESC`;

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB error", error: err });
    }
    res.json(results);
  });
};


/* ADMIN STUDENT MANAGEMENT CONTROLLERS */
// All-Students table with pagination
exports.listAllStudents = (req, res) => {
  let { page = 1, limit = 10, batch = "" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;
  // Get total count
  let countQuery = "SELECT COUNT(*) as total FROM students";
  let dataQuery = "SELECT * FROM students";
  const params = [];
  if (batch) {
    countQuery += " WHERE batch = ?";
    dataQuery += " WHERE batch = ?";
    params.push(batch);
  }
  dataQuery += " ORDER BY id DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);
  db.query(countQuery, batch ? [batch] : [], (err, countResult) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    db.query(dataQuery, params, (err2, results) => {
      if (err2)
        return res.status(500).json({ message: "DB error", error: err2 });
      res.json({ students: results, totalPages });
    });
  });
};
// Admin Reviews student and updates status email notification is sent
exports.updateStudentStatus = (req, res) => {
  const { studentId, status, declinedFields } = req.body;
  if (!studentId || !["approved", "declined", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid studentId or status" });
  }

  // Prepare declinedFields for DB
  const declinedFieldsStr = Array.isArray(declinedFields)
    ? JSON.stringify(declinedFields)
    : null;

  // Update student status and declinedFields
  db.query(
    "UPDATE students SET status = ?, declinedFields = ? WHERE id = ?",
    [status, declinedFieldsStr, studentId],
    (updateErr, updateResult) => {
      if (updateErr) {
        // Error updating student status
        return res
          .status(500)
          .json({ message: "Database error", error: updateErr });
      }

      // Get student details
      db.query(
        "SELECT email, firstName, lastName FROM students WHERE id = ?",
        [studentId],
        (selectErr, studentRows) => {
          if (selectErr) {
            // Error fetching student
            return res
              .status(500)
              .json({ message: "Database error", error: selectErr });
          }

          if (!studentRows || studentRows.length === 0) {
            return res.json({
              message: "Status updated, but student not found for email",
            });
          }

          const { email, firstName, lastName } = studentRows[0];
          const fullName = `${firstName} ${lastName}`;
          let emailSubject,
            emailHtml = "";

          if (status === "approved") {
            emailSubject =
              "Congratulations! Your Registration Has Been Approved";
            emailHtml = `
              <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f9f9f9;">
                <div style="text-align:center;padding:20px 0;background:#4CAF50;color:white;">
                  <h1>Registration Approved</h1>
                </div>
                <div style="padding:20px;background:white;">
                  <p>Dear ${fullName},</p>
                  <p>We are pleased to inform you that your registration with Bhagwan Parshuram Institute of Technology has been <strong>approved</strong>.</p>
                  <div style="background:#f0f8ff;padding:15px;margin:20px 0;border-left:4px solid #4CAF50;">
                    <p style="margin:0;">Next Steps:</p>
                    <ul style="margin:10px 0 0 20px;">
                      <li>Access your profile at <a href="https://erp-student.bpitindia.com/login" target="_blank" rel="noopener noreferrer">Student Portal</a> to view your approved application</li>
                      <li>Contact admissions for any queries at <a href="https://admissions-enquiry.bpitindia.ac.in/" target="_blank" rel="noopener noreferrer">https://admissions-enquiry.bpitindia.ac.in/</a></li>
                    </ul>
                  </div>
                  <p>Welcome to BPIT! We look forward to having you as part of our academic community.</p>
                  <p>Best regards,<br>The Admissions Team</p>
                </div>
                <div style="text-align:center;padding:20px;font-size:12px;color:#777;">
                  <p>© ${new Date().getFullYear()} Bhagwan Parshuram Institute of Technology</p>
                </div>
              </div>
            `;
          } else if (status === "declined") {
            const declinedArr = Array.isArray(declinedFields)
              ? declinedFields
              : [];
            let declinedListHtml = "";

            if (declinedArr.length > 0) {
              declinedListHtml = `
                <div style="background:#fff8f8;padding:15px;margin:20px 0;border-left:4px solid #f44336;">
                  <p>The following fields were not approved:</p>
                  <ul style="margin:10px 0 0 20px;">
                    ${declinedArr.map((field) => `<li>${field}</li>`).join("")}
                  </ul>
                  <p>Please review and update these fields before resubmitting your application. Access your profile at <a href="https://erp-student.bpitindia.com/login" target="_blank" rel="noopener noreferrer">https://erp-student.bpitindia.com/login</a> and update your declined sections.</p>
                </div>
              `;
            }

            emailSubject = "Your Registration Status Update";
            emailHtml = `
              <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f9f9f9;">
                <div style="text-align:center;padding:20px 0;background:#f44336;color:white;">
                  <h1>Registration Decision</h1>
                </div>
                <div style="padding:20px;background:white;">
                  <p>Dear ${fullName},</p>
                  <p>After careful consideration, we regret to inform you that your registration with Bhagwan Parshuram Institute of Technology has been <strong>declined</strong>.</p>
                  ${declinedListHtml}
                  <div style="background:#fff8f8;padding:15px;margin:20px 0;border-left:4px solid #f44336;">
                    <p>For more information about this decision, please contact our admissions office:</p>
                    <p style="margin:10px 0 0 0;">
                      Website: <a href="https://admissions-enquiry.bpitindia.ac.in/" target="_blank" rel="noopener noreferrer">https://admissions-enquiry.bpitindia.ac.in/</a><br>
                      Phone: 011-2757 2900, 011-2757 1080
                    </p>
                  </div>
                  <p>We appreciate your interest in BPIT and encourage you to explore other educational opportunities.</p>
                  <p>Sincerely,<br>The Admissions Team</p>
                </div>
                <div style="text-align:center;padding:20px;font-size:12px;color:#777;">
                  <p>© ${new Date().getFullYear()} Bhagwan Parshuram Institute of Technology</p>
                </div>
              </div>
            `;
          } else {
            emailSubject = "Your Registration Status Update";
            emailHtml = `
              <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f9f9f9;">
                <div style="text-align:center;padding:20px 0;background:#FFA500;color:white;">
                  <h1>Registration Under Review</h1>
                </div>
                <div style="padding:20px;background:white;">
                  <p>Dear ${fullName},</p>
                  <p>Your registration with Bhagwan Parshuram Institute of Technology is currently <strong>pending review</strong>.</p>
                  <p>Our admissions team is carefully reviewing your application. You will receive another notification once a decision has been made.</p>
                  <div style="background:#fffaf0;padding:15px;margin:20px 0;border-left:4px solid #FFA500;">
                    <p>Current Status: <strong>Pending Review</strong></p>
                    <p>Expected decision timeline: 5-7 business days</p>
                    <p>Track your application status at <a href="https://erp-student.bpitindia.com/login" target="_blank" rel="noopener noreferrer">https://erp-student.bpitindia.com/login</a></p>
                  </div>
                  <p>Thank you for your patience.</p>
                  <p>Best regards,<br>The Admissions Team</p>
                </div>
                <div style="text-align:center;padding:20px;font-size:12px;color:#777;">
                  <p>© ${new Date().getFullYear()} Bhagwan Parshuram Institute of Technology</p>
                </div>
              </div>
            `;
          }

          // Send the email
          sendStatusEmail(email, emailSubject, emailHtml)
            .then(() => {
              // Get updated student list
              db.query("SELECT * FROM students", (fetchErr, allStudents) => {
                if (fetchErr) {
                  // Error fetching all students
                  return res
                    .status(500)
                    .json({ message: "Database error", error: fetchErr });
                }

                res.json({
                  message: "Status updated and email sent",
                  students: allStudents,
                });
              });
            })
            .catch((emailErr) => {
              // Error sending email
              res.status(500).json({ message: "Email error", error: emailErr });
            });
        }
      );
    }
  );
};
// List students by status (pending, approved, declined)
// Pending, Approved and Declined Tables
exports.listStudentsByStatus = (req, res) => {
  const { status } = req.params;
  let { page = 1, limit = 10, batch = "" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  if (!["pending", "approved", "declined"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const offset = (page - 1) * limit;
  let countQuery = "SELECT COUNT(*) as total FROM students WHERE status = ?";
  let dataQuery = "SELECT * FROM students WHERE status = ?";
  const params = [status];
  if (batch) {
    countQuery += " AND batch = ?";
    dataQuery += " AND batch = ?";
    params.push(batch);
  }
  dataQuery += " ORDER BY id DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);
  db.query(
    countQuery,
    batch ? [status, batch] : [status],
    (err, countResult) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);
      db.query(dataQuery, params, (err2, results) => {
        if (err2)
          return res.status(500).json({ message: "DB error", error: err2 });
        const students = results.map((s) => ({
          ...s,
          declinedFields: s.declinedFields ? JSON.parse(s.declinedFields) : [],
        }));
        res.json({ students, totalPages });
      });
    }
  );
};


/* SEARCH CONTROLLER */
// Search students with filters and pagination
exports.searchStudents = (req, res) => {
  const { q = "", gender = "", course = "", batch = "", page = 1 } = req.query;
  const pageSize = 10;
  const offset = (parseInt(page) - 1) * pageSize;

  let baseQuery = `SELECT * FROM students WHERE 1=1`;
  let countQuery = `SELECT COUNT(*) as total FROM students WHERE 1=1`;
  const params = [];
  const countParams = [];

  // Apply search filter
  if (q) {
    baseQuery += ` AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR studentId LIKE ?)`;
    countQuery += ` AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR studentId LIKE ?)`;
    const likeQ = `%${q}%`;
    params.push(likeQ, likeQ, likeQ, likeQ);
    countParams.push(likeQ, likeQ, likeQ, likeQ);
  }

  // Apply gender filter
  if (gender) {
    baseQuery += ` AND gender = ?`;
    countQuery += ` AND gender = ?`;
    params.push(gender);
    countParams.push(gender);
  }

  // Apply course filter
  if (course) {
    baseQuery += ` AND course = ?`;
    countQuery += ` AND course = ?`;
    params.push(course);
    countParams.push(course);
  }

  // Apply batch filter
  if (batch) {
    baseQuery += ` AND batch = ?`;
    countQuery += ` AND batch = ?`;
    params.push(batch);
    countParams.push(batch);
  }

  // Pagination and ordering
  baseQuery += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
  params.push(pageSize, offset);

  db.query(baseQuery, params, (err, students) => {
    if (err) {
      // Student query error
      return res.status(500).json({ message: "Database error", error: err });
    }
    db.query(countQuery, countParams, (err2, countResult) => {
      if (err2) {
        // Count query error
        return res.status(500).json({ message: "Database error", error: err2 });
      }
      const totalPages = Math.ceil(countResult[0].total / pageSize);
      res.json({ students, totalPages });
    });
  });
};


/* STUDENT DETAILS CONTROLLER */
// Get full details of a student (all registration sections) - for admin
exports.getStudentFullDetails = (req, res) => {
  const { studentId } = req.params;
  if (!studentId)
    return res.status(400).json({ message: "studentId required" });
  db.query(
    "SELECT * FROM students WHERE id = ?",
    [studentId],
    (err, results) => {
      if (err || !results || results.length === 0)
        return res.status(404).json({ message: "Student not found" });
      const student = results[0];
      // Split fields into sections for frontend
      // Personal
      const personal = {
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
      };
      // Parent
      const parent = {
        father_name: student.father_name,
        father_qualification: student.father_qualification,
        father_occupation: student.father_occupation,
        father_email: student.father_email,
        father_mobile: student.father_mobile,
        father_telephoneSTD: student.father_telephoneSTD,
        father_telephone: student.father_telephone,
        father_officeAddress: student.father_officeAddress,
        mother_name: student.mother_name,
        mother_qualification: student.mother_qualification,
        mother_occupation: student.mother_occupation,
        mother_email: student.mother_email,
        mother_mobile: student.mother_mobile,
        mother_telephoneSTD: student.mother_telephoneSTD,
        mother_telephone: student.mother_telephone,
        mother_officeAddress: student.mother_officeAddress,
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
      // Academic (nested structure)
      let academicAchievements = student.academicAchievements;
      let coCurricularAchievements = student.coCurricularAchievements;
      try {
        if (typeof academicAchievements === "string")
          academicAchievements = JSON.parse(academicAchievements);
      } catch {}
      try {
        if (typeof coCurricularAchievements === "string")
          coCurricularAchievements = JSON.parse(coCurricularAchievements);
      } catch {}
      const academic = {
        classX: {
          institute: student.classX_institute || student.classX || "",
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
      let declinedFields = [];
      if (student.declinedFields) {
        try {
          declinedFields = JSON.parse(student.declinedFields);
        } catch {
          declinedFields = [];
        }
      }
      res.json({ personal, parent, documents, academic, declinedFields });
    }
  );
};


/* ADMIN PROFILE CONTROLLERS */
exports.getAdminProfile = (req, res) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ message: "No admin email found in token" });
  }
  res.json({ email: req.user.email });
};


/* AI REVIEW CONTROLLER */
// AI-based review of student data (mock implementation)
// In real scenario, integrate with an AI service to validate data
// Here, we just check for presence of required fields and return a mock review
// This endpoint can be used by admin to get an AI-generated review of a student's data
// It returns which fields are valid and which are missing/invalid
// The admin can then use this review to make decisions
exports.aiReviewStudent = (req, res) => {
  const { student } = req.body;
  if (!student) {
    return res.status(400).json({ message: "Student data required" });
  }

  const verifications = {
    personal: {},
    academic: {},
    parent: {},
    documents: {},
  };
  const declinedFields = [];

  // --- Personal Info Validation ---
  const personal = student.personal || {};
  const personalRequired = [
    "course",
    "firstName",
    "lastName",
    "abcId",
    "dob",
    "placeOfBirth",
    "mobile",
    "email",
    "examRoll",
    "examRank",
    "gender",
    "category",
    "region",
    "currentAddress",
    "permanentAddress",
    "feeReimbursement",
    "antiRaggingRef",
  ];
  personalRequired.forEach((field) => {
    if (!personal[field]) {
      verifications.personal[field] = false;
      declinedFields.push(`personal.${field}`);
    } else {
      verifications.personal[field] = true;
    }
  });

  // --- Academic Info Validation ---
  const academic = student.academic || {};
  const classX = academic.classX || {};
  const classXII = academic.classXII || {};
  const otherQualification = academic.otherQualification || {};

  // Class X
  ["institute", "board", "year", "aggregate"].forEach((f) => {
    if (!classX[f]) {
      verifications.academic[`classX.${f}`] = false;
      declinedFields.push(`academic.classX.${f}`);
    } else {
      verifications.academic[`classX.${f}`] = true;
    }
  });

  // Class XII
  ["institute", "board", "year", "aggregate", "pcm"].forEach((f) => {
    if (!classXII[f]) {
      verifications.academic[`classXII.${f}`] = false;
      declinedFields.push(`academic.classXII.${f}`);
    } else {
      verifications.academic[`classXII.${f}`] = true;
    }
  });

  // Other Qualification (if any field is filled, then all are required)
  const oqAny =
    otherQualification.institute ||
    otherQualification.board ||
    otherQualification.year ||
    otherQualification.aggregate ||
    otherQualification.pcm;
  if (oqAny) {
    ["institute", "board", "year", "aggregate", "pcm"].forEach((f) => {
      if (!otherQualification[f]) {
        verifications.academic[`otherQualification.${f}`] = false;
        declinedFields.push(`academic.otherQualification.${f}`);
      } else {
        verifications.academic[`otherQualification.${f}`] = true;
      }
    });
  }

  // --- Parent Info Validation ---
  const parents = student.parents || { father: {}, mother: {} };
  const father = parents.father || {};
  const mother = parents.mother || {};

  const fatherRequired = [
    "name",
    "qualification",
    "occupation",
    "email",
    "mobile",
  ];
  fatherRequired.forEach((f) => {
    if (!father[f]) {
      verifications.parent[`father.${f}`] = false;
      declinedFields.push(`parent.father.${f}`);
    } else {
      verifications.parent[`father.${f}`] = true;
    }
  });

  const motherRequired = ["name", "qualification", "occupation", "mobile"];
  motherRequired.forEach((f) => {
    if (!mother[f]) {
      verifications.parent[`mother.${f}`] = false;
      declinedFields.push(`parent.mother.${f}`);
    } else {
      verifications.parent[`mother.${f}`] = true;
    }
  });

  if (!parents.familyIncome) {
    verifications.parent["familyIncome"] = false;
    declinedFields.push("parent.familyIncome");
  } else {
    verifications.parent["familyIncome"] = true;
  }

  // --- Documents Validation ---
  const documents = student.documents || {};
  const requiredDocs = [
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
    "academicFeeReceipt",
    "collegeFeeReceipt",
    "parentSignature",
  ];
  requiredDocs.forEach((doc) => {
    if (!documents[doc]) {
      verifications.documents[doc] = false;
      declinedFields.push(`documents.${doc}`);
    } else {
      verifications.documents[doc] = true;
    }
  });

  // --- Final Status ---
  const status = declinedFields.length > 0 ? "declined" : "approved";

  return res.json({ status, declinedFields, verifications });
};


/* DELETE STUDENT CONTROLLER */
// Delete student by ID
exports.deleteStudent = (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  // First, check if student exists
  db.query(
    "SELECT id, firstName, lastName, email FROM students WHERE id = ?",
    [studentId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "DB error", error: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const studentInfo = result[0];

      // Delete the student
      db.query(
        "DELETE FROM students WHERE id = ?",
        [studentId],
        (deleteErr, deleteResult) => {
          if (deleteErr) {
            return res
              .status(500)
              .json({ message: "Failed to delete student", error: deleteErr });
          }

          if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: "Student not found" });
          }

          res.json({
            message: "Student deleted successfully",
            deletedStudent: {
              id: studentInfo.id,
              name: `${studentInfo.firstName} ${studentInfo.lastName}`,
              email: studentInfo.email,
            },
          });
        }
      );
    }
  );
};
