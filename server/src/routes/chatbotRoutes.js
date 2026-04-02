const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

const { protect } = require('../middleware/authMiddleware');
const { getOverviewStats } = require('../controllers/adminController');

router.get('/stats', protect, getOverviewStats);
router.post('/chat', chatbotController.handleChatMessage);

module.exports = router;