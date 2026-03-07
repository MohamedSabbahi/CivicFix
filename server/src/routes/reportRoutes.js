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
        deleteReport,
        getAllCategories }
        = require('../controllers/reportController');

const { getReportComments,
        createComment ,
        deleteComment } 
        = require('../controllers/commentController');

router.post('/', protect, upload.single('image'), validateReport, createReport);
router.get('/categories', getAllCategories);
router.get('/status-update', updateStatusByMagicLink);
router.get('/', getAllReports);
router.get('/nearby', getNearbyReports);
router.get('/:id' ,getReportById);
router.put('/:id', protect, updateReport);
router.delete('/:id', protect, admin, deleteReport);

// Comment routes
router.get('/:id/comments', getReportComments);
router.post('/:id/comments', protect, createComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;