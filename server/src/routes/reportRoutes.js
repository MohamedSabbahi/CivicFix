const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateReport } = require('../middleware/reportValidator'); 

// 1. Imports from reportController.js
const { 
    createCivicIssue,
    updateStatusByMagicLink,
    getAllCivicIssues,
    getMyCivicIssues,         // Now properly imported AND used below
    getNearbyCivicIssues,
    getCivicIssueById,
    updateCivicIssue,
    deleteCivicIssue,
    getAllCategories,
    assignDepartment,
    showAssignDepartmentForm,
    getCivicIssueInterventions
} = require('../controllers/reportController');

// 2. Imports from commentController.js
const { 
    getReportComments,
    createComment,
    deleteComment 
} = require('../controllers/commentController');

// --- REPORT ROUTES ---

// Create a new report (Requires Auth, Image, and Validation)
router.post('/', protect, upload.single('image'), validateReport, createCivicIssue);

// Public feeds and categories
router.get('/categories', getAllCategories);
router.get('/', getAllCivicIssues);
router.get('/nearby', getNearbyCivicIssues);

// User-specific dashboard (Crucial fix: Now correctly routed)
router.get('/my-reports', protect, getMyCivicIssues);

// Specific report details and interventions
router.get('/:id', getCivicIssueById);
router.get('/:id/departments', protect, getCivicIssueInterventions);

// Updates and Deletions
router.put('/:id', protect, updateCivicIssue);
router.delete('/:id', protect, admin, deleteCivicIssue);

// --- COMMENT ROUTES ---
router.get('/:id/comments', getReportComments);
router.post('/:id/comments', protect, createComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// --- MAGIC LINK / DEPARTMENT ROUTES ---
router.get('/status-update', updateStatusByMagicLink);
router.get('/:reportId/assign-department', showAssignDepartmentForm);
router.post('/:reportId/assign-department', assignDepartment);

module.exports = router;