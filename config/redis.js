const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD || undefined
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis Connected'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };