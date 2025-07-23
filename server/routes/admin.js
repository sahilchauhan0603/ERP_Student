const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeRole } = require('../middleware/auth');
const { otpLimiter } = require('../controllers/adminController');

// Admin dashboard stats
router.get('/stats', authenticate, authorizeRole('admin'), adminController.getStudentStats);

// Admin endpoints
router.get('/list', authenticate, authorizeRole('admin'), adminController.listAllStudents);

router.post('/verify-student', authenticate, authorizeRole('admin'), adminController.updateStudentStatus);

// Admin OTP login endpoints
router.post('/send-otp', otpLimiter, adminController.sendAdminOtp);
router.post('/verify-otp', otpLimiter, adminController.verifyAdminOtp);
router.post('/logout', adminController.logout);

// Filtered students by status
router.get('/list/:status', authenticate, authorizeRole('admin'), adminController.listStudentsByStatus);

// Search students by name or email
router.get('/search', authenticate, authorizeRole('admin'), adminController.searchStudents);

// Get full details of a student (all registration sections)
router.get('/student-details/:studentId', authenticate, authorizeRole('admin'), adminController.getStudentFullDetails);

// Admin profile endpoint
router.get('/me', authenticate, authorizeRole('admin'), adminController.getAdminProfile);

module.exports = router;
