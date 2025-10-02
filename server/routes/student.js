const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { authenticate, authorizeRole } = require("../middleware/auth");
const { otpLimiter } = require("../controllers/studentController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Simple auth check endpoint (no authentication required)
router.get("/auth-check", (req, res) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const { verifyToken } = require("../utils/jwt");
  const payload = verifyToken(token);
  if (!payload || payload.role !== "student") {
    return res.status(401).json({ authenticated: false });
  }

  res.json({ authenticated: true, role: "student" });
});

// Accept only JSON (base64 for files)
router.post("/register", studentController.registerStudent);

// OTP login endpoints
router.post("/send-login-otp", otpLimiter, studentController.sendLoginOtp);
router.post("/verify-login-otp", otpLimiter, studentController.verifyLoginOtp);

// Get student profile by email
router.get(
  "/profile",
  authenticate,
  authorizeRole("student"),
  studentController.getStudentProfile
);

// Get student dashboard data by email
router.get(
  "/dashboard",
  authenticate,
  authorizeRole("student"),
  studentController.getStudentDashboard
);

// Detailed student info routes 
router.get(
  "/students/me/details",
  authenticate,
  authorizeRole("student"),
  (req, res, next) => {
    studentController.getStudentDetailsMe(req, res, next);
  }
);

// Get student details by ID (admin or the student themselves)
router.get(
  "/students/:studentId/details",
  authenticate,
  authorizeRole("student"),
  (req, res, next) => {
    studentController.getStudentDetailsById(req, res, next);
  }
);

// Update student profile (including file uploads)
router.patch(
  "/students/me/update-declined",
  authenticate,
  authorizeRole("student"),
  upload.any(),
  studentController.updateDeclinedFields
);

// Logout endpoint
router.post("/logout", studentController.logout);

// Real-time uniqueness check endpoints
router.get("/check-email", studentController.checkEmailExists);
router.get("/check-abcid", studentController.checkAbcIdExists);

// Public statistics endpoint for homepage
router.get("/stats", studentController.getPublicStats);

// Public testing endpoint: get all students (name, email, batch, branch)
router.get('/test/all', async (req, res) => {
  try {
    const db = require('../config/db');
    db.query('SELECT firstName, email, batch, course FROM students', (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err });
      }
      res.json({ students: results });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error });
  }
});

module.exports = router;
