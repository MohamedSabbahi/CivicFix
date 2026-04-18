const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateReport } = require('../middleware/reportValidator'); 

// FIX: These names now match your reportController.js exports exactly
const { 
    createCivicIssue,
    getAllCivicIssues,
    getMyCivicIssues,
    getCivicIssueById,
    getNearbyCivicIssues,
    updateCivicIssue,
    deleteCivicIssue,
    updateStatusByMagicLink,
    getAllCategories,
    assignDepartment,
    showAssignDepartmentForm,
    getCivicIssueInterventions, // Replaces 'getReportDepartments'
    updateCivicIssueStatus
} = require('../controllers/reportController');

const { 
    getReportComments,
    createComment,
    deleteComment 
} = require('../controllers/commentController');

// Standardized Routes
router.post('/', protect, upload.single('image'), validateReport, createCivicIssue);
router.get('/categories', getAllCategories);
router.get('/status-update', updateStatusByMagicLink);
router.get('/', getAllCivicIssues);
router.get('/nearby', getNearbyCivicIssues);
router.get('/my-reports', protect, getMyCivicIssues);
router.get('/:id', getCivicIssueById);
router.get('/:id/departments', protect, getCivicIssueInterventions);
router.put('/:id', protect, updateCivicIssue);
router.delete('/:id', protect, admin, deleteCivicIssue);

// Comment routes

router.post('/:id/comments', protect, createComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Magic Link routes
router.get('/:reportId/assign-department', showAssignDepartmentForm);
router.post('/:reportId/assign-department', assignDepartment);

// Department Status Update
router.patch('/:id/status', protect, updateCivicIssueStatus);

module.exports = router;