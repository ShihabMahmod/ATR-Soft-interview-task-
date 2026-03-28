const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = ApiError.notFound(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value`;
    error = ApiError.conflict(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      path: val.path,
      message: val.message,
    }));
    const message = 'Validation failed';
    error = ApiError.badRequest(message, errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = ApiError.unauthorized(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = ApiError.unauthorized(message);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Max size is 5MB';
    error = ApiError.badRequest(message);
  }

  // Send response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;