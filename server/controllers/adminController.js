// All admin logic separated from student logic
const sendStatusEmail = require("../utils/sendStatusEmail");
const adminOTPMailer = require("../utils/adminOTPMailer");
const { signToken } = require("../utils/jwt");
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 10 minutes
  max: 15, // limit each IP to 5 requests per windowMs
  message: { message: "Too many OTP requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
module.exports.otpLimiter = otpLimiter;

// --- Admin Dashboard/Student Management ---
const db = require("../config/db");

// --- Admin OTP Login ---
const adminOtpStore = {};

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

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ message: "Logged out successfully" });
};

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
                      <li>Access your profile at <a href="https://erp-student-sm4v.onrender.com/login" target="_blank" rel="noopener noreferrer">Student Portal</a> to view your approved application</li>
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
            sendStatusEmail(email, emailSubject, emailHtml).catch(() => {});
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
                  <p>Please review and update these fields before resubmitting your application. Access your profile at <a href="https://erp-student-sm4v.onrender.com/login" target="_blank" rel="noopener noreferrer">https://erp-student-sm4v.onrender.com/login</a> and update your declined sections.</p>
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
            sendStatusEmail(email, emailSubject, emailHtml).catch(() => {});
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
                    <p>Track your application status at <a href="https://erp-student-sm4v.onrender.com/login" target="_blank" rel="noopener noreferrer">https://erp-student-sm4v.onrender.com/login</a></p>
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
  db.query(countQuery, batch ? [status, batch] : [status], (err, countResult) => {
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
  });
};

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
      };
      // Parent
      const parent = {
        father_name: student.father_name,
        father_mobile: student.father_mobile,
        father_email: student.father_email,
        mother_name: student.mother_name,
        mother_mobile: student.mother_mobile,
        mother_email: student.mother_email,
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

exports.getAdminProfile = (req, res) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ message: "No admin email found in token" });
  }
  res.json({ email: req.user.email });
};
