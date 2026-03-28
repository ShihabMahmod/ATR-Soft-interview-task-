const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  handler: (req, res) => {
    throw ApiError.tooManyRequests('Too many requests, please try again later');
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    throw ApiError.tooManyRequests('Too many login attempts, please try again later');
  },
});

module.exports = { limiter, authLimiter };