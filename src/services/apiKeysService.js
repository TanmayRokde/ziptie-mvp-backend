const apiKeysDao = require('../dao/apiKeysDao');
const userDao = require('../dao/userDao');
const apiKeysGenerator = require('../utils/apiKeysGenerator');

module.exports = {
  generateAndStoreKey: async () => {
    try {
      const { publicKey, privateKey } = apiKeysGenerator.generateKeyPair();
      const result = await apiKeysDao.storePublicKey(publicKey);
      
      if (!result.success) {
        throw new Error('Failed to store key in Redis');
      }
      
      return {
        privateKey,
        publicKey,
        keyHash: result.keyHash,
        ttl: result.ttl
      };
    } catch (error) {
      throw new Error(`Key generation failed: ${error.message}`);
    }
  },

  authenticateWithPrivateKey: async (privateKey) => {
    try {
      // generate public key from private key
      const publicKey = apiKeysGenerator.generatePublicKeyFromPrivate(privateKey);
      if (!publicKey) {
        return { valid: false, reason: 'Invalid private key format' };
      }

      // First, check if public key exists in PostgreSQL (linked to user)
      const userResult = await userDao.findUserByPublicKey(publicKey);
      if (!userResult.found) {
        return { valid: false, reason: 'Key not authorized - user not found' };
      }

      // Then, check if public key exists in Redis
      const redisResult = await apiKeysDao.checkPublicKey(publicKey);
      if (!redisResult.found) {
        return { valid: false, reason: 'Key not authorized - key not active in Redis' };
      }

      return {
        valid: true,
        publicKey: redisResult.publicKey,
        user: userResult.user
      };

    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }
};