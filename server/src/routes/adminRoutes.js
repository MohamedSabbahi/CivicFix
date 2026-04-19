const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');
const { getDepartmentStats ,  
        getOverviewStats ,
        addDepartment,
        deleteDepartment,
        updateCivicIssueStatus,
        getDepartments,
        updateDepartment,
        getCivicIssuesByPeriod
    } = require('../controllers/adminController');


// Stats endpoint - Admin seulement
router.get('/stats/overview', protect, admin, getOverviewStats);
router.get('/departments',        protect, admin, getDepartments);
router.get('/stats/department', protect, admin, getDepartmentStats);
router.post('/departments', protect, admin, addDepartment);
router.delete('/departments/:id', protect, admin, deleteDepartment);
router.put('/reports/:id/status',protect, admin, updateCivicIssueStatus);
router.get('/departments', protect, admin, getDepartments);
router.put('/departments/:id', protect, admin, updateDepartment);
router.get('/reports/period',protect, admin, getCivicIssuesByPeriod);


module.exports = router;