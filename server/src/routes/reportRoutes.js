const express = require('express');
const router = express.Router();
const { protect ,admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateReport } = require('../middleware/reportValidator'); 
const { createReport,
        updateStatusByMagicLink,
        getAllReports,
        getNearbyReports,
        getReportById,
        updateReport ,
        deleteReport }
    = require('../controllers/reportController');


router.post('/', protect, upload.single('image'), validateReport, createReport);
router.get('/status-update', updateStatusByMagicLink);
router.get('/', getAllReports);
router.get('/nearby', getNearbyReports);
router.get('/:id' ,getReportById);
router.put('/:id', protect, updateReport);
router.delete('/:id', protect, admin, deleteReport);
module.exports = router;