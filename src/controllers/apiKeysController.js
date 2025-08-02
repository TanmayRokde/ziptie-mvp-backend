const apiKeysService = require('../services/apiKeysService');

class KeyController {
  async generateKey(req, res) {
    try {
      const result = await apiKeysService.generateAndStoreKey();
      
      const base64PrivateKey = Buffer.from(result.privateKey).toString('base64');
      
      return res.status(201).json({
        success: true,
        message: 'Key pair generated and stored in Redis successfully',
        data: {
          privateKey: result.privateKey,
          base64PrivateKey: base64PrivateKey,
          publicKey: result.publicKey,
          keyHash: result.keyHash,
          ttlSeconds: result.ttl,
          expiresAt: new Date(Date.now() + result.ttl * 1000).toISOString(),
        }
      });
      
    } catch (error) {
      console.error('❌ Key generation error:', error.message);
      return res.status(500).json({
        success: false,
        message: `Key generation failed: ${error.message}`
      });
    }
  }

}

module.exports = new KeyController();