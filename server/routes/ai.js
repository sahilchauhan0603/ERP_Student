const express = require('express');
const router = express.Router();
const { chatWithGemini, getQuickHelp } = require('../controllers/aiController');

// Main AI chat endpoint with enhanced ERP context
router.post('/chat', chatWithGemini);

// Quick help endpoint for common queries
router.get('/help', getQuickHelp);

module.exports = router;


