const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

// Convert hex string to buffer if it's a string
const getKeyBuffer = () => {
  if (typeof ENCRYPTION_KEY === 'string') {
    return Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  }
  return ENCRYPTION_KEY;
};

module.exports = {
  encrypt: (text) => {
    try {
      if (!text) return null;

      const key = getKeyBuffer();
      const iv = crypto.randomBytes(16); 
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Encryption error:', error.message);
      throw new Error('Failed to encrypt data');
    }
  },

  decrypt: (encryptedText) => {
    try {
      if (!encryptedText) return null;

      const key = getKeyBuffer();
      const parts = encryptedText.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encryptedData = parts[2];

      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error.message);
      throw new Error('Failed to decrypt data');
    }
  }
};
