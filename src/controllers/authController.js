const userService = require('../services/userService');

const sanitizeInput = (value) =>
  typeof value === 'string' ? value.trim() : value;

module.exports = {
  signup: async (req, res) => {
    try {
      const email = sanitizeInput(req.body.email || '');
      const password = req.body.password || '';
      const name = sanitizeInput(req.body.name || '');

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }

      const result = await userService.signup({ email, password, name });

      return res.status(201).json({
        success: true,
        message: 'Account created',
        data: result
      });
    } catch (error) {
      const status = error.message === 'Email already registered' ? 409 : 500;
      return res.status(status).json({
        success: false,
        message: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const email = sanitizeInput(req.body.email || '');
      const password = req.body.password || '';

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await userService.login({ email, password });

      return res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed'
      });
    }
  }
};
