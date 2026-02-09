const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createReport} = require('../controllers/reportController');
const { check } = require('express-validator');

const reportValidation = [
    check('title', 'Title is required').not().isEmpty(),
    check('latitude', 'Latitude is required').isNumeric(),
    check('longitude', 'Longitude is required').isNumeric(),
    check('categoryId', 'Category ID is required').isNumeric(),
];

// POST /api/reports
router.post('/', protect,upload.single('image'),reportValidation,createReport);

module.exports = router;