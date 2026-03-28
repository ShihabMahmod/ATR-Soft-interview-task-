const { getRedisClient } = require('../config/redis');
const logger = require('./logger');

class CacheUtil {
  constructor(prefix = 'blog') {
    this.client = getRedisClient();
    this.prefix = prefix;
    this.defaultTTL = 3600; // 1 hour
  }

  generateKey(key) {
    return `${this.prefix}:${key}`;
  }

  async get(key) {
    try {
      if (!this.client) return null;
      
      const data = await this.client.get(this.generateKey(key));
      if (data) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!this.client) return false;
      
      await this.client.setEx(
        this.generateKey(key),
        ttl,
        JSON.stringify(value)
      );
      logger.debug(`Cache set: ${key}`);
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.client) return false;
      
      await this.client.del(this.generateKey(key));
      logger.debug(`Cache deleted: ${key}`);
      return true;
    } catch (error) {
      logger.error('Redis delete error:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      if (!this.client) return false;
      
      const keys = await this.client.keys(this.generateKey(pattern));
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug(`Cache deleted pattern: ${pattern} (${keys.length} keys)`);
      }
      return true;
    } catch (error) {
      logger.error('Redis delete pattern error:', error);
      return false;
    }
  }

  async flush() {
    try {
      if (!this.client) return false;
      
      const keys = await this.client.keys(`${this.prefix}:*`);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug(`Cache flushed: ${keys.length} keys deleted`);
      }
      return true;
    } catch (error) {
      logger.error('Redis flush error:', error);
      return false;
    }
  }

  async remember(key, ttl, callback) {
    const cached = await this.get(key);
    if (cached) return cached;

    const fresh = await callback();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  async rememberForever(key, callback) {
    return this.remember(key, 0, callback);
  }
}

module.exports = CacheUtil;