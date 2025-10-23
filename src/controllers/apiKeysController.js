const apiKeysService = require('../services/apiKeysService');
const prisma = require('../lib/prisma');

module.exports = {
  generateKey: async (req, res) => {
    try {
      const userId = req.userId; // From authenticate middleware

      // Generate new key pair and store in Redis
      const result = await apiKeysService.generateAndStoreKey();

      // Update user's public key in PostgreSQL (create or update)
      await prisma.user.update({
        where: { id: userId },
        data: { apiKey: result.publicKey }
      });

      const base64PrivateKey = Buffer.from(result.privateKey).toString('base64');

      return res.status(201).json({
        success: true,
        message: 'Key pair generated and stored successfully. Save your private key - this is a one-time view!',
        data: {
          privateKey: base64PrivateKey, // Send only base64 version for one-time view
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