const redisConfig = require('../config/redis');
const apiKeysGenerator = require('../utils/apiKeysGenerator');

class apiKeyDao {
  constructor() {
    this.redis = null;
    this.TTL_SECONDS = 3600;
  }

  async init() {
    if (!this.redis) {
      this.redis = redisConfig.getClient();
      await redisConfig.connect();
    }
  }

  async storePublicKey(publicKey) {
    await this.init();
    
    try {
      //create hash
      const keyHash = apiKeysGenerator.createPublicKeyHash(publicKey);
      const redisKey = `pubkey:${keyHash}`;
      // store hash
      await this.redis.setEx(redisKey, this.TTL_SECONDS, publicKey);
    
      return { success: true, keyHash, ttl: this.TTL_SECONDS };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkPublicKey(publicKey) {
    await this.init();
    
    try {
      const keyHash = apiKeysGenerator.createPublicKeyHash(publicKey);
      const redisKey = `pubkey:${keyHash}`;
      // check public key hash
      const storedPublicKey = await this.redis.get(redisKey);
      
      if (!storedPublicKey) {
        return { found: false };
      }

      return { found: true, publicKey: storedPublicKey };
      
    } catch (error) {
      return { found: false, error: error.message };
    }
  }
}

module.exports = new apiKeyDao();