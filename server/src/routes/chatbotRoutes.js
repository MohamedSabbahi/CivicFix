const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Define the endpoint: POST /api/chatbot/chat
// Note: You will eventually add your authMiddleware here so only logged-in citizens can chat
router.post('/chat', chatbotController.handleChatMessage);

module.exports = router;