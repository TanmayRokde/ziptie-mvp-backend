const axios = require('axios');

module.exports = {
    createShortUrl : async ({ longUrl, userId, ttl }) => {
    try {
          const response = await axios.post(`${process.env.URL_SHORTENER_SERVICE_URL}/shorten`, {
            longUrl,
            userId,
            ttl
          });
      
          return response.data;
        } catch (error) {
          if (error.response) {
            throw new Error(error.response.data.message || 'Failed to create short URL');
          }
          throw new Error('URL shortener service is unavailable');
        }
      }
}
