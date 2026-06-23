const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

const { protect } = require('../middleware/authMiddleware');
const { getOverviewStats, getDepartmentStats } = require('../controllers/adminController');

router.get('/stats', protect, getOverviewStats);
router.get('/analytics', protect, chatbotController.getAnalyticsSummary);
router.get('/department-stats', protect, getDepartmentStats);
router.get('/warmup', chatbotController.warmupAiService);
router.post('/chat', chatbotController.handleChatMessage);

module.exports = router;