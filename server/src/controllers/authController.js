const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const prisma = new PrismaClient();

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

exports.register = async (req, res) => {
    // Check if there are validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CITIZEN',
            },
        });

        res.status(201).json({
            token: generateToken(user.id),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during Registration' });
    }
};

exports.login = async (req, res) => {

    //We check if there are validation errors. if any, we return 400 with the errors array.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({ message: 'Invalid credentials'});
        }
        res.json({
            token: generateToken(user.id),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error during Login' });
    }
};

exports.getMe = async (req, res) => {
    res.status(200).json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    });
};

exports.forgotPassword = async (req, res) => {
  try {
    // 1. Get user by email
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // 2. Generate the Random Token (Raw)
    // This is what the user will type into the app
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 3. Hash the token for the Database
    // Security: If DB is hacked, they only see the hash, not the key.
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 4. Save Hash + Expiration to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 Minutes
      },
    });

    // 5. Create the Message
    // Since this is a mobile app, we send them the TOKEN to copy-paste.
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n
        Please enter the following token in your app to reset your password:\n\n
        ${resetToken}\n\n
        This token expires in 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);
      // Rollback: If email fails, clear the token fields so the user isn't locked
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reset Password - Validates token and updates password
// @route   PUT /api/auth/resetpassword/:resettoken
exports.resetPassword = async (req, res) => {
  try {
    // 1. Hash the incoming token to compare with DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // 2. Find user with valid token AND valid expiration
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpires: { gt: new Date() }, // Check if expiration is in the future
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // 3. Set new password
    // (Bcrypt hashing happens here usually, or if you have a middleware)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 4. Update User & Clear Fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({ success: true, data: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};