const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


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
        createdAt: req.user.createdAt,
    });
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, username, location } = req.body;
        
        // Get the user ID from the authenticated user
        const userId = req.user.id;

        // Update the user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                username,
                location,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
};

// server/src/controllers/authController.js
exports.forgotPassword = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // 1. Generate a secure 4-digit numeric PIN (1000 to 9999)
    const resetToken = crypto.randomInt(1000, 10000).toString();

    // 2. Hash the PIN for the Database securely
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 Minutes
      },
    });

    // 3. Dark Mode HTML Email Template
    const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">CivicFix</h1>
              <p style="color: #94a3b8; margin-top: 5px; font-size: 14px;">Password Reset Request</p>
          </div>
          <div style="background-color: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155;">
              <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                  Hello ${user.name || 'Citizen'},<br><br>
                  We received a request to reset the password for your account. Please enter the following 4-digit verification code in your app to proceed:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                  <span style="display: inline-block; background-color: #0f172a; color: #60a5fa; font-size: 42px; font-weight: bold; letter-spacing: 12px; padding: 20px 40px; border-radius: 12px; border: 2px dashed #3b82f6;">
                      ${resetToken}
                  </span>
              </div>
              <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-bottom: 0;">
                  This code will expire in <strong style="color: #f8fafc;">10 minutes</strong>.
              </p>
          </div>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Code',
      html: htmlMessage,
      message: `Your reset code is: ${resetToken}`, 
    });

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error("Forgot PW Error:", err);
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
      return res.status(400).json({ message: 'Invalid token or expired token' });
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
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};
