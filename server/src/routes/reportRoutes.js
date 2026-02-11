const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createReport,updateStatusByMagicLink  } = require('../controllers/reportController');
const { validateReport } = require('../middleware/reportValidator'); 

router.post('/', protect, upload.single('image'), validateReport, createReport);

router.get('/status-update', updateStatusByMagicLink);
module.exports = router;