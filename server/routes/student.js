
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Accept only JSON (base64 for files)
router.post('/register', studentController.registerStudent);

module.exports = router;
