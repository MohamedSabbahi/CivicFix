const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');
const { 
    getDepartmentStats,  
    getOverviewStats,
    addDepartment,
    deleteDepartment,
    getDepartments,
    updateDepartment,
    getCivicIssuesByPeriod 
} = require('../controllers/adminController');

// Stats endpoints - Admin seulement
router.get('/stats/overview', protect, admin, getOverviewStats);
router.get('/stats/department', protect, admin, getDepartmentStats);

// Department management endpoints
router.get('/departments', protect, admin, getDepartments);
router.post('/departments', protect, admin, addDepartment);
router.put('/departments/:id', protect, admin, updateDepartment);
router.delete('/departments/:id', protect, admin, deleteDepartment);

// Civic Issues reporting endpoints
// FIXED: Changed '/reports/period' to '/civic-issues/period' to match your DB model updates
router.get('/civic-issues/period', protect, admin, getCivicIssuesByPeriod);

module.exports = router;