const { check, validationResult } = require('express-validator');

/**
 * Validates incoming report data: title (5-100 chars), optional description (10+ chars),
 * latitude/longitude within Earth ranges, and a numeric categoryId.
 * Returns 400 with detailed validation errors if any rule fails.
 */
exports.validateReport = [
    check('title')
        .trim()
        .not().isEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5-100 characters'),

    check('description')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

    check('latitude')
        .isFloat({ min: -90, max: 90 }).withMessage('Invalid Latitude (must be -90 to 90)'),
    
    check('longitude')
        .isFloat({ min: -180, max: 180 }).withMessage('Invalid Longitude (must be -180 to 180)'),

    check('categoryId')
        .isInt().withMessage('Category ID must be a valid number')
        .toInt(),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // No file cleanup needed — multer memoryStorage files are auto garbage-collected
            return res.status(400).json({ 
                message: "Validation Failed",
                errors: errors.array() 
            });
        }

        next();
    }
];