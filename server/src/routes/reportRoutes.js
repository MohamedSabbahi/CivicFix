const express = require('express');
const router = express.Router();
const { protect ,admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createReport,
        getAllReports,
        getReportById,
        updateReport ,
        deleteReport }
    = require('../controllers/reportController');
const { validateReport } = require('../middleware/reportValidator'); 

router.post('/', protect, upload.single('image'), validateReport, createReport);

router.get('/', getAllReports);
router.get('/:id' ,getReportById);
router.put('/:id', protect, updateReport);
router.delete('/:id', protect, admin, deleteReport);
module.exports = router;