const urlService = require('../services/urlService');

class UrlController {
  async testRoute(req, res) {
    try {
      const result = await urlService.getTestMessage();
      
      return res.json({
        success: true,
        message: 'Test route controller',
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UrlController();