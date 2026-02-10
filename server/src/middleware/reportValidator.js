const { check, validationResult } = require('express-validator');
const fs = require('fs');

exports.validateReport = [
    // --- PART 1: THE RULES (Sanitization & Validation) ---
    
    // Title: Remove whitespace, ensure it exists, ensure length
    check('title')
        .trim()
        .not().isEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5-100 characters'),

    // Description: Remove whitespace, ensure minimum detail
    check('description')
        .optional({ nullable: true, checkFalsy: true }) // Allows null, undefined, or ""
        .trim()
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

    // Coordinates: Must be numbers within valid Earth ranges
    check('latitude')
        .isFloat({ min: -90, max: 90 }).withMessage('Invalid Latitude (must be -90 to 90)'),
    
    check('longitude')
        .isFloat({ min: -180, max: 180 }).withMessage('Invalid Longitude (must be -180 to 180)'),

    // Category: Must be an integer ID
    check('categoryId')
        .isInt().withMessage('Category ID must be a valid number')
        .toInt(), // Sanitize: Convert string "1" to integer 1

    // --- PART 2: THE BOUNCER (Error Handling & Cleanup) ---
    (req, res, next) => {
        // 1. Gather all errors from the rules above
        const errors = validationResult(req);

        // 2. If there are errors, we must stop everything
        if (!errors.isEmpty()) {
            
            // 3. CRITICAL: The "Zombie File" Cleanup
            // Multer ran BEFORE this validator. If we stop here, 
            // the uploaded image is stranded on the server. We must delete it.
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    // This is a callback, just like in Multer!
                    if (err) console.error("Error deleting file:", err);
                });
            }

            // 4. Return the errors to the frontend
            return res.status(400).json({ 
                message: "Validation Failed",
                errors: errors.array() 
            });
        }

        // 5. If no errors, let the request pass to the Controller
        next();
    }
];