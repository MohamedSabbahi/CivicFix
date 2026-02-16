const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');
const { getDepartmentStats ,  
        getOverviewStats ,
        addDepartment,
        deleteDepartment
    } = require('../controllers/adminController');


// Stats endpoint - Admin seulement
router.get('/stats/overview', protect, admin, getOverviewStats);
router.get('/stats/department', protect, admin, getDepartmentStats);
router.post('/departments', protect, admin, addDepartment);
router.delete('/departments/:id', protect, admin, deleteDepartment);

module.exports = router;