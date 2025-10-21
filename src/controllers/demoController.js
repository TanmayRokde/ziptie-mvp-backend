const crypto = require('crypto');
const shortlinkService = require('../services/shortlinkService');

const createFallbackResponse = (url) => {
  const baseUrl = process.env.DEMO_FALLBACK_BASE_URL || 'https://links.ziptie.dev';
  const shortKey = crypto
    .createHash('sha256')
    .update(`${url}-${Date.now()}-${Math.random()}`)
    .digest('base64url')
    .slice(0, 10);

  return {
    source: 'fallback',
    shortKey,
    shortUrl: `${baseUrl.replace(/\/$/, '')}/${shortKey}`,
    expiresIn: parseInt(process.env.DEMO_SHORT_TTL || '3600', 10),
    userId: 'demo-user',
    createdAt: new Date().toISOString()
  };
};

module.exports = {
  shorten: async (req, res) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'A valid url is required'
        });
      }

      const result = await shortlinkService.createShortUrl({
        longUrl: url,
        userId: 'demo-user',
        ttl: parseInt(process.env.DEMO_SHORT_TTL || '3600', 10)
      });

      return res.status(201).json({
        success: true,
        data: {
          ...result,
          userId: 'demo-user',
          source: 'shortener'
        }
      });
    } catch (error) {
      const fallback = createFallbackResponse(req.body?.url || '');
      console.error('[demoController:shorten]', error);

      return res.status(200).json({
        success: true,
        message: 'Primary shortener unavailable, served cached-style fallback.',
        data: fallback,
        meta: {
          degraded: true,
          reason: error.message || 'shortener unavailable'
        }
      });
    }
  }
};
