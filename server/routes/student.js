const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorizeRole } = require('../middleware/auth');
const { otpLimiter } = require('../controllers/studentController');

// Accept only JSON (base64 for files)
router.post('/register', studentController.registerStudent);

// OTP login endpoints
router.post('/send-login-otp', otpLimiter, studentController.sendLoginOtp);
router.post('/verify-login-otp', otpLimiter, studentController.verifyLoginOtp);

// Get student profile by email
router.get('/profile', authenticate, authorizeRole('student'), studentController.getStudentProfile);

// Get student dashboard data by email
router.get('/dashboard', authenticate, authorizeRole('student'), studentController.getStudentDashboard);

router.get('/students/:studentId/details', authenticate, authorizeRole('student'), studentController.getStudentDetailsById);

router.patch('/students/:id/update-declined', authenticate, authorizeRole('student'), studentController.updateDeclinedFields);

router.post('/logout', studentController.logout);

module.exports = router;
