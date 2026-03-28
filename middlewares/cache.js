const CacheUtil = require('../utils/cache');
const logger = require('../utils/logger');

const cacheMiddleware = (duration = 3600, keyPrefix = 'route') => {
  return async (req, res, next) => {
    try {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cache = new CacheUtil(keyPrefix);
      const key = `${req.originalUrl}-${req.user?._id || 'guest'}`;
      
      const cachedResponse = await cache.get(key);
      
      if (cachedResponse) {
        logger.debug(`Serving from cache: ${key}`);
        return res.status(200).json(cachedResponse);
      }

      // Store original send function
      const originalSend = res.json;
      
      // Override send function
      res.json = function(body) {
        if (res.statusCode === 200) {
          cache.set(key, body, duration);
        }
        originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

const clearCache = (pattern) => {
  return async (req, res, next) => {
    try {
      const cache = new CacheUtil();
      await cache.delPattern(pattern);
      next();
    } catch (error) {
      logger.error('Clear cache error:', error);
      next();
    }
  };
};

module.exports = { cacheMiddleware, clearCache };