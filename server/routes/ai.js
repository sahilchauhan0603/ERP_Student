const express = require('express');
const router = express.Router();
const { chatWithGemini } = require('../controllers/aiController');

router.post('/chat', chatWithGemini);

module.exports = router;


