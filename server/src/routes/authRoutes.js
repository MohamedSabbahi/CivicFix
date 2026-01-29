const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');
const { check } = require('express-validator');

const registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
];

router.post('/register', registerValidation, register);

module.exports = router;