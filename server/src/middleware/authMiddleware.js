const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
    let token;
    //Check if the authorization header exists and starts with 'Bearer'
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //Extract the token from the header
            token = req.headers.authorization.split(' ')[1];
            //Verify the token and decode it to get the user ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({ where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    location: true,
                    role: true,
                    createdAt: true,
                }
            });
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized: User not found' });
            }
            next();
        } catch (error) {
            console.error('Not authorized:', error.message);
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
};

const admin = (req, res, next) => {
    // We check the user object that 'protect' already fetched for us
    if (req.user && req.user.role === 'ADMIN') {
        next(); // Authorization success!
    } else {
        res.status(403).json({ message: 'Not authorized as a citizen' }); // 403 = Forbidden
    }
};


module.exports = { protect, admin };