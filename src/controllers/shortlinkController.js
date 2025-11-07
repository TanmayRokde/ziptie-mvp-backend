const shortlinkService = require('../services/shortlinkService');
const userDao = require('../dao/userDao');

const DEFAULT_DOMAIN = process.env.DEFAULT_DOMAIN;

module.exports = {
    createShortUrl : async (req, res) => {
        try {
          const { longUrl, ttl } = req.body;
          const userId = req.user.id; 

          if (!longUrl || typeof longUrl !== 'string') {
            return res.status(400).json({
              success: false,
              message: 'Long URL is required'
            });
          }

          const ttlNumber = Number(ttl);
          if (!Number.isInteger(ttlNumber) || ttlNumber <= 0) {
            return res.status(400).json({
              success: false,
              message: 'TTL must be a positive integer'
            });
          }

          // Fetch user's latest domain using DAO
          const domainResult = await userDao.getLatestUserDomain(userId);

          // Use user's domain if available, otherwise use default
          let domain = DEFAULT_DOMAIN;
          let pathPrefix = '';

          if (domainResult.success && domainResult.domain) {
            const userDomain = domainResult.domain;
            domain = userDomain.domain.startsWith('http')
              ? userDomain.domain
              : `https://${userDomain.domain}`;
            pathPrefix = userDomain.pathPrefix || '';
          }

          const result = await shortlinkService.createShortUrl({
            longUrl,
            userId,
            ttl: ttlNumber
          });

          if (result && result.shortKey) {
            const normalizedDomain = domain.replace(/\/+$/, '');
            const normalizedPrefix = pathPrefix
              ? `/${pathPrefix.replace(/^\/+|\/+$/g, '')}`
              : '';
            result.shortUrl = `${normalizedDomain}${normalizedPrefix}/${result.shortKey}`;
          }

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
      },

      resolveShortUrl: async (req, res) => {
        try {
          const { shortKey } = req.body;
          
          if (!shortKey) {
            return res.status(400).json({
              success: false,
              message: 'Short URL key is required'
            });
          }
          
          const result = await shortlinkService.resolveShortUrl(shortKey);
          
          if (!result || !result.longUrl) {
            return res.status(404).json({
              success: false,
              message: 'URL not found or has expired'
            });
          }
          return res.status(200).json({
            success: true,
            data: result
          });
        } catch (error) {
          if (error.message === 'URL not found' || error.message.includes('not found')) {
            return res.status(404).json({
              success: false,
              message: 'URL not found or has expired'
            });
          }
          
          return res.status(500).json({
            success: false,
            message: 'Error resolving URL'
          });
        }
      },
};
