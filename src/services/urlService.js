class UrlService {
  async getTestMessage() {
    return {
      message: 'Test route SERVICE',
    };
  }
}

module.exports = new UrlService();