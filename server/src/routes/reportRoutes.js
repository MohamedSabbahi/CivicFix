const express = require('express');
const router = express.Router();
const { protect ,admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateReport } = require('../middleware/reportValidator'); 
const { createReport,
        updateStatusByMagicLink,
        getAllReports,
        getMyReports,
        getNearbyReports,
        getReportById,
        updateReport ,
        deleteReport,
        getAllCategories,
        assignDepartment,
        showAssignDepartmentForm,
        getReportDepartments }
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
router.get('/my-reports', protect, getMyReports);
router.get('/:id' ,getReportById);
router.get('/:id/departments', protect, getReportDepartments);
router.put('/:id', protect, updateReport);
router.delete('/:id', protect, admin, deleteReport);

// Comment routes
router.get('/:id/comments', getReportComments);
router.post('/:id/comments', protect, createComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Department assignment routes
router.get('/:reportId/assign-department', showAssignDepartmentForm);
router.post('/:reportId/assign-department', assignDepartment);

router.get('/:id/departments', protect, getReportDepartments);

module.exports = router;
