const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin dashboard stats
router.get('/stats', adminController.getStudentStats);
// Admin endpoints
router.get('/list', adminController.listAllStudents);
router.post('/update-status', adminController.updateStudentStatus);
// Admin OTP login endpoints
router.post('/send-otp', adminController.sendAdminOtp);
router.post('/verify-otp', adminController.verifyAdminOtp);

// Filtered students by status
router.get('/list/:status', adminController.listStudentsByStatus);
// Search students by name or email
router.get('/search', adminController.searchStudents);

// Get full details of a student (all registration sections)
router.get('/student-details/:studentId', adminController.getStudentFullDetails);

module.exports = router;
