const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');


// Accept only JSON (base64 for files)
router.post('/register', studentController.registerStudent);

// OTP login endpoints
router.post('/send-login-otp', studentController.sendLoginOtp);
router.post('/verify-login-otp', studentController.verifyLoginOtp);

// Get student profile by email
router.get('/profile', studentController.getStudentProfile);

// Get student dashboard data by email
router.get('/dashboard', studentController.getStudentDashboard);

module.exports = router;
