const apiKeysService = require('../services/apiKeysService');

module.exports = {
  authenticatePrivateKey: async (req, res, next) => {
    try {
      let privateKey = req.headers['private-key'];
      
      if (!privateKey) {
        return res.status(401).json({
          success: false,
          message: 'Private key is required in private-key header'
        });
      }

      if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        // base64 to private key
          privateKey = Buffer.from(privateKey, 'base64').toString();
      }

      // Authenticate
      const authResult = await apiKeysService.authenticateWithPrivateKey(privateKey);

      if (!authResult.valid) {
        return res.status(401).json({
          success: false,
          message: `Access denied - ${authResult.reason}`
        });
      }

      // Attach user and authentication info to request
      req.authenticated = true;
      req.user = authResult.user;
      req.publicKey = authResult.publicKey;
      next();
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }
};