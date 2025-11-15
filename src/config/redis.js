const redis = require('redis');

let client = null;

const buildRedisConfig = () => {
  if (process.env.UPSTASH_REDIS_URL) {
    return {
      url: process.env.UPSTASH_REDIS_URL,
      socket: {
        tls: process.env.UPSTASH_REDIS_URL.startsWith('rediss://')
      }
    };
  }

  if (process.env.REDIS_URL) {
    return {
      url: process.env.REDIS_URL
    };
  }

  return {
    socket: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379
    },
    password: process.env.REDIS_PASSWORD || undefined
  };
};

module.exports = {
  connect: async () => {
    try {
      client = redis.createClient(buildRedisConfig());

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
