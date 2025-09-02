const express = require('express');
const router = express.Router();
const { chatWithGemini, streamWithGemini } = require('../controllers/aiController');

router.post('/chat', chatWithGemini);
router.post('/chat/stream', streamWithGemini);

module.exports = router;


