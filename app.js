require('dotenv').config();
require('express-async-errors');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const { limiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/user/auth.routes');
const userBlogRoutes = require('./routes/user/blog.routes');
const userCategoryRoutes = require('./routes/user/category.routes');
const adminRoutes = require('./routes/admin/admin.routes');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Sanitize data
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// Rate limiting
app.use('/api', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', userBlogRoutes);
app.use('/api/categories', userCategoryRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;