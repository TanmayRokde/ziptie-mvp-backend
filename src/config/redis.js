const redis = require('redis');

let client = null;

module.exports = {
  connect: async () => {
    try {
      client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
      });

      client.on('error', (err) => {
        console.error('Redis Error:', err);
      });

      client.on('connect', () => {
        console.log('Connected to Redis');
      });

      await client.connect();
      return client;
      
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  },

  getClient: () => {
    return client;
  },

  disconnect: async () => {
    if (client) {
      await client.disconnect();
      console.log('Disconnected from Redis');
    }
  }
};