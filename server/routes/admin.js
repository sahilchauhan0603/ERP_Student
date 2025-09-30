const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, authorizeRole } = require("../middleware/auth");
const { otpLimiter } = require("../controllers/adminController");

// Simple auth check endpoint (no authentication required)
router.get("/auth-check", (req, res) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const { verifyToken } = require("../utils/jwt");
  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    return res.status(401).json({ authenticated: false });
  }

  res.json({ authenticated: true, role: "admin" });
});

// Dashboard stats Route
router.get(
  "/stats",
  authenticate,
  authorizeRole("admin"),
  adminController.getStudentStats
);

// Batch-wise statistics Route
router.get(
  "/batch-stats",
  authenticate,
  authorizeRole("admin"),
  adminController.getBatchStats
);

// Branch-wise statistics Route
router.get(
  "/branch-stats",
  authenticate,
  authorizeRole("admin"),
  adminController.getBranchStats
);

// This route is not required currently
router.get(
  "/list",
  authenticate,
  authorizeRole("admin"),
  adminController.listAllStudents
);

// Update student status Route (approve/decline)
router.post(
  "/verify-student",
  authenticate,
  authorizeRole("admin"),
  adminController.updateStudentStatus
);

// Admin OTP login endpoints
router.post("/send-otp", otpLimiter, adminController.sendAdminOtp);
router.post("/verify-otp", otpLimiter, adminController.verifyAdminOtp);
router.post("/logout", adminController.logout);

// Filtered students by status -> Pending/Approved/Declined Table
router.get(
  "/list/:status",
  authenticate,
  authorizeRole("admin"),
  adminController.listStudentsByStatus
);

// Search students by name/email/gender/course/id -> Search Bars
router.get(
  "/search",
  authenticate,
  authorizeRole("admin"),
  adminController.searchStudents
);

// Get full details of a student (all registration sections) -> AllStudents table
router.get(
  "/student-details/:studentId",
  authenticate,
  authorizeRole("admin"),
  adminController.getStudentFullDetails
);

// Admin profile endpoint -> for getting the email of the logged in user
router.get(
  "/me",
  authenticate,
  authorizeRole("admin"),
  adminController.getAdminProfile
);

router.post(
  "/ai-review-student",
  authenticate,
  authorizeRole("admin"),
  adminController.aiReviewStudent
);

// Delete student route
router.delete(
  "/students/:studentId",
  authenticate,
  authorizeRole("admin"),
  adminController.deleteStudent
);

module.exports = router;
