const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

const { protect } = require('../middleware/authMiddleware');
const { getOverviewStats } = require('../controllers/adminController');

router.get('/stats', protect, getOverviewStats);
// Direct analytics route — bypasses Groq, queries DB through admin controllers
router.get('/analytics', protect, chatbotController.getAnalyticsSummary);
router.post('/chat', chatbotController.handleChatMessage);

module.exports = router;