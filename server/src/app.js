const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');

const app = express();


app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.use(express.json());

// Define routes here
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'CivicFix Backend is Running!'
  })
});

app.use('/api/auth', authRoutes);

module.exports = app;