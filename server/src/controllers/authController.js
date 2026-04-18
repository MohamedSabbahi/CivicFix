const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    // Check if there are validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
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
    // We check if there are validation errors. if any, we return 400 with the errors array.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
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

    const resetToken = crypto.randomInt(1000, 10000).toString();
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 1. Save the token to the database first
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000), 
      },
    });

    const htmlMessage = `
      <span style="display: inline-block; background-color: #0f172a; color: #60a5fa; font-size: 42px; font-weight: bold; letter-spacing: 12px; padding: 20px 40px; border-radius: 12px; border: 2px dashed #3b82f6;">
          ${resetToken}
      </span>
      `;

    // 2. Wrap the email dispatch in a try/catch
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Password Reset Code',
        html: htmlMessage,
        message: `Your reset code is: ${resetToken}`, 
      });

      res.status(200).json({ success: true, message: 'OTP sent to email' });
      
    } catch (emailError) {
      console.error("Resend API Error:", emailError);
      
      // 3. Rollback the database if the email fails so the user can try again immediately
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      return res.status(500).json({ message: 'Email could not be sent. Please try again.' });
    }

  } catch (err) {
    console.error("Forgot PW Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpires: { gt: new Date() }, 
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

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

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true }
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error." });
  }
};