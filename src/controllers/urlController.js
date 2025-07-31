const urlService = require('../services/urlService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class UrlController {
  async testRoute(req, res) {
    try {
      const result = await urlService.getTestMessage();
      return successResponse(res, result, 'Test route accessed successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new UrlController();