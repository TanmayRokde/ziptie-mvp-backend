const redisConfig = require('../config/redis');
const apiKeysGenerator = require('../utils/apiKeysGenerator');

let redis = null;
const TTL_SECONDS = 3600;

const init = async () => {
  if (!redis) {
    redis = redisConfig.getClient();
  }
};

module.exports = {
  storePublicKey: async (publicKey) => {
    await init();
    
    try {
      //create hash
      const keyHash = apiKeysGenerator.createPublicKeyHash(publicKey);
      const redisKey = `pubkey:${keyHash}`;
      // store hash
      await redis.setEx(redisKey, TTL_SECONDS, publicKey);
    
      return { success: true, keyHash, ttl: TTL_SECONDS };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  checkPublicKey: async (publicKey) => {
    await init();
    
    try {
      const keyHash = apiKeysGenerator.createPublicKeyHash(publicKey);
      const redisKey = `pubkey:${keyHash}`;
      // check public key hash
      const storedPublicKey = await redis.get(redisKey);
      
      if (!storedPublicKey) {
        return { found: false };
      }

      return { found: true, publicKey: storedPublicKey };
      
    } catch (error) {
      return { found: false, error: error.message };
    }
  }
};