const mongoose = require('mongoose');
const app = require('./app');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  logger.error(err.stack);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ MongoDB Connected');

    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis Connected');

    // Start listening
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      logger.info(`✅ Server running on port ${port}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      logger.error(err.stack);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        logger.info('💥 Process terminated!');
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();