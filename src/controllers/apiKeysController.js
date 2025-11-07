const apiKeysService = require('../services/apiKeysService');
const encryption = require('../utils/encryption');
const prisma = require('../lib/prisma');

module.exports = {
  generateKey: async (req, res) => {
    try {
      const userId = req.userId;

      const result = await apiKeysService.generateAndStoreKey();
      const base64PrivateKey = Buffer.from(result.privateKey).toString('base64');

      const encryptedPublicKey = encryption.encrypt(result.publicKey);
      const encryptedBase64PrivateKey = encryption.encrypt(base64PrivateKey);

      await prisma.user.update({
        where: { id: userId },
        data: {
          publicKey: encryptedPublicKey,
          privateKey: encryptedBase64PrivateKey
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Key pair generated and stored successfully.',
        data: {
          privateKey: base64PrivateKey, 
          ttlSeconds: result.ttl,
          expiresAt: new Date(Date.now() + result.ttl * 1000).toISOString(),
        }
      });

    } catch (error) {
      console.error('Key generation error:', error.message);
      return res.status(500).json({
        success: false,
        message: `Key generation failed: ${error.message}`
      });
    }
  }

}