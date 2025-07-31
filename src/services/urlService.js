class UrlService {
  async getTestMessage() {
    return {
      message: 'Test route SERVICE working successfully!',
    };
  }
}

module.exports = new UrlService();