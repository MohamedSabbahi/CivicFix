const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

const registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 8+ characters, with at least 1 uppercase and 1 number').isStrongPassword({ 
            minLength: 8, 
            minLowercase: 1, 
            minUppercase: 1, 
            minNumbers: 1, 
            minSymbols: 0
        }),
];

const loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
];

router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.get('/profile', protect, getMe);
router.put('/profileUpdate', protect, updateProfile);
router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resettoken', resetPassword);
router.post('/verifyResetCode', verifyResetCode);
router.put('/changePassword', protect, changePassword);

module.exports = router;
