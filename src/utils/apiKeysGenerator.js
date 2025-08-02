const crypto = require('crypto');

class apiKeysGenerator {
  static generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return { publicKey, privateKey };
  }

  static generatePublicKeyFromPrivate(privateKey) {
    try {
      // Create key object from private key
      const keyObject = crypto.createPrivateKey({
        key: privateKey,
        format: 'pem',
        type: 'pkcs8'
      });

      // Extract public key from private key
      const publicKey = crypto.createPublicKey(keyObject);
      
      const publicKeyPem = publicKey.export({
        type: 'spki',
        format: 'pem'
      });

      return publicKeyPem;
    } catch (error) {
      console.error('Error generating public key from private key:', error.message);
      return null;
    }
  }

  // Create a hash of public key for storing in redis
  static createPublicKeyHash(publicKey) {
    const hash = crypto.createHash('sha256');
    hash.update(publicKey);
    return hash.digest('hex');
  }
}

module.exports = apiKeysGenerator;