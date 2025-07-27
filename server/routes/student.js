const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorizeRole } = require('../middleware/auth');
const { otpLimiter } = require('../controllers/studentController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Accept only JSON (base64 for files)
router.post('/register', studentController.registerStudent);

// OTP login endpoints
router.post('/send-login-otp', otpLimiter, studentController.sendLoginOtp);
router.post('/verify-login-otp', otpLimiter, studentController.verifyLoginOtp);

// Get student profile by email
router.get('/profile', authenticate, authorizeRole('student'), studentController.getStudentProfile);

// Get student dashboard data by email
router.get('/dashboard', authenticate, authorizeRole('student'), studentController.getStudentDashboard);

router.get('/students/me/details', authenticate, authorizeRole('student'), (req, res, next) => {
  studentController.getStudentDetailsMe(req, res, next);
});
router.get('/students/:studentId/details', authenticate, authorizeRole('student'), (req, res, next) => {
  studentController.getStudentDetailsById(req, res, next);
});

// Update-declined route: use multer for file uploads
router.patch('/students/me/update-declined', authenticate, authorizeRole('student'), upload.any(), studentController.updateDeclinedFields);

router.post('/logout', studentController.logout);

// Real-time uniqueness check endpoints
router.get('/check-email', studentController.checkEmailExists);
router.get('/check-abcid', studentController.checkAbcIdExists);

module.exports = router;
