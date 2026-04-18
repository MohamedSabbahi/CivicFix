// server/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

// Trust Render's proxy so rate limiting works correctly
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));


app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: { message: 'Too many attempts, please try again after 15 minutes.' }
});

//prevent brute-forcing the 4-digit code
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgotpassword', authLimiter);
app.use('/api/auth/resetpassword', authLimiter); 

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
});
app.use(generalLimiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'CivicFix Backend is Running!'
  })
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/chatbot', chatbotRoutes);

module.exports = app;