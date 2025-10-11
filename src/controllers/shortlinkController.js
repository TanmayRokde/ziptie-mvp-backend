const shortlinkService = require('../services/shortlinkService');

module.exports = {
    createShortUrl : async (req, res) => {
        try {
          const { longUrl, userId, ttl } = req.body;
      
          // Validation
          if (!longUrl || typeof longUrl !== 'string') {
            return res.status(400).json({
              success: false,
              message: 'Long URL is required'
            });
          }
      
          if (!userId || typeof userId !== 'string') {
            return res.status(400).json({
              success: false,
              message: 'User ID is required'
            });
          }
      
          const ttlNumber = Number(ttl);
          if (!Number.isInteger(ttlNumber) || ttlNumber <= 0) {
            return res.status(400).json({
              success: false,
              message: 'TTL must be a positive integer'
            });
          }
      
          const result = await shortlinkService.createShortUrl({
            longUrl,
            userId,
            ttl: ttlNumber
          });
      
          return res.status(201).json({
            success: true,
            data: result
          });
        } catch (error) {
          console.error('[shortlinkController:createShortUrl]', error);
          return res.status(500).json({
            success: false,
            message: error.message
          });
        }
      }
};
