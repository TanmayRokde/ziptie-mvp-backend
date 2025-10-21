const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ziptie-dev-secret';

module.exports = {
  authenticate: async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing'
      });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.userId = payload.sub;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }
};
