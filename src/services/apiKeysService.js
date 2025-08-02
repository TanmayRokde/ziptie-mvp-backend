const apiKeysDao = require('../dao/apiKeysDao');
const apiKeysGenerator = require('../utils/apiKeysGenerator');

class apiKeysService {
  async generateAndStoreKey() {
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
  }

  async authenticateWithPrivateKey(privateKey) {
    try {
      // generate public key from from private key
      const publicKey = apiKeysGenerator.generatePublicKeyFromPrivate(privateKey);
      if (!publicKey) {
        return { valid: false, reason: 'Invalid private key format' };
      }
      // check if public key exist in redis
      const result = await apiKeysDao.checkPublicKey(publicKey);
      if (!result.found) {
        return { valid: false, reason: 'Key not authorized' };
      }
      
      return { valid: true, publicKey: result.publicKey };
      
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }
}

module.exports = new apiKeysService();