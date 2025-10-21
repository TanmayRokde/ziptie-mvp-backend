const userService = require('../services/userService');

module.exports = {
  profile: async (req, res) => {
    try {
      const result = await userService.getProfile(req.userId);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      const status = error.message === 'User not found' ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: error.message
      });
    }
  },

  listDomains: async (req, res) => {
    try {
      const profile = await userService.getProfile(req.userId);

      return res.json({
        success: true,
        data: profile.domains
      });
    } catch (error) {
      const status = error.message === 'User not found' ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: error.message
      });
    }
  },

  upsertDomain: async (req, res) => {
    try {
      const { domain, pathPrefix, id } = req.body;
      if (!domain) {
        return res.status(400).json({
          success: false,
          message: 'Domain is required'
        });
      }

      const result = await userService.upsertDomain({
        userId: req.userId,
        domainId: id,
        domain,
        pathPrefix
      });

      return res.status(id ? 200 : 201).json({
        success: true,
        data: {
          id: result.id,
          domain: result.domain,
          pathPrefix: result.pathPrefix,
          createdAt: result.createdAt
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};
