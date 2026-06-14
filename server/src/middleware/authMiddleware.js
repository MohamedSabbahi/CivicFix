const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

/**
 * Extracts and verifies the JWT from the Authorization header,
 * then attaches the authenticated user object to req.user.
 * Rejects with 401 if the token is missing, invalid, or the user no longer exists.
 */
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({ where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                }
            });
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized: User not found' });
            }
            return next();
        } catch (error) {
            console.error('Not authorized:', error.message);
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    }
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
};

/**
 * Checks that the already-authenticated user (set by protect) has the ADMIN role.
 * Returns 403 Forbidden if the user is not an admin.
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a citizen' });
    }
};

module.exports = { protect, admin };