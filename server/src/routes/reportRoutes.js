const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateReport } = require('../middleware/reportValidator'); 
const { 
    createCivicIssue,        
    updateStatusByMagicLink,
    getAllCivicIssues,       
    getMyCivicIssues,         
    getNearbyCivicIssues,     
    getCivicIssueById,        
    updateCivicIssue,         
    deleteCivicIssue,         
    getAllCategories,
    assignDepartment,
    showAssignDepartmentForm,
    getCivicIssueInterventions 
} = require('../controllers/reportController');

const { 
    getReportComments,
    createComment,
    deleteComment 
} = require('../controllers/commentController');


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
router.get('/:id/comments', getReportComments);
router.post('/:id/comments', protect, createComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Department assignment routes
router.get('/:reportId/assign-department', showAssignDepartmentForm);
router.post('/:reportId/assign-department', assignDepartment);

module.exports = router;