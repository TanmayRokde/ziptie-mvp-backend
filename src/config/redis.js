const { createClient } = require('redis');
const { Redis: UpstashRedis } = require('@upstash/redis');

let client = null;

const canUseUpstash = () =>
  Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const createUpstashClient = () => {
  const upstash = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });

  return {
    async connect() {},
    async disconnect() {},
    on() {},
    async setEx(key, ttlSeconds, value) {
      await upstash.set(key, value, { ex: ttlSeconds });
    },
    async get(key) {
      return upstash.get(key);
    }
  };
};

const buildRedisConfig = () => {
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
    if (client) {
      return client;
    }

    try {
      if (canUseUpstash()) {
        client = createUpstashClient();
        console.log('[redis] using Upstash REST client');
      } else {
        client = createClient(buildRedisConfig());

        client.on('error', (err) => {
          console.error('Redis Error:', err);
        });

        client.on('connect', () => {
          console.log('Connected to Redis');
        });
      }

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
      client = null;
    }
  }
};
