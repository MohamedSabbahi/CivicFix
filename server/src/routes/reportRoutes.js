const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateReport } = require('../middleware/reportValidator');
const { createCivicIssue,
        getAllCivicIssues,
        getMyCivicIssues,
        getCivicIssueById,
        getCivicIssueInterventions,
        updateCivicIssue,
        deleteCivicIssue,
        updateStatusByMagicLink,
        getNearbyCivicIssues,
        getAllCategories,
        assignDepartment,
        showAssignDepartmentForm,
        updateCivicIssueStatus }
        = require('../controllers/reportController');

const { getCivicIssueComments,
        createComment,
        deleteComment }
        = require('../controllers/commentController');

router.post('/', protect, upload.single('image'), validateReport, createCivicIssue);
router.get('/categories', getAllCategories);
router.get('/status-update', updateStatusByMagicLink);
router.get('/', getAllCivicIssues);
router.get('/nearby', getNearbyCivicIssues);
router.get('/my-reports', protect, getMyCivicIssues);
router.get('/:id', getCivicIssueById);
router.get('/:id/interventions', protect, getCivicIssueInterventions);
router.put('/:id', protect, updateCivicIssue);
router.put('/:id/status', protect, admin, updateCivicIssueStatus);
router.delete('/:id', protect, admin, deleteCivicIssue);

// Comment routes
router.get('/:id/comments', getCivicIssueComments);
router.post('/:id/comments', protect, createComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Department assignment routes
router.get('/:reportId/assign-department', showAssignDepartmentForm);
router.post('/:reportId/assign-department', assignDepartment);

module.exports = router;