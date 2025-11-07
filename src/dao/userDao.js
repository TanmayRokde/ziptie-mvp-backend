const prisma = require('../lib/prisma');
const encryption = require('../utils/encryption');

module.exports = {
  findUserByPublicKey: async (publicKey) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          publicKey: {
            not: null
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          publicKey: true,
          privateKey: true,
          createdAt: true
        }
      });

      for (const user of users) {
        try {
          const decryptedPublicKey = encryption.decrypt(user.publicKey);
          if (decryptedPublicKey === publicKey) {
            return { found: true, user };
          }
        } catch (error) {
          console.error('Failed to decrypt public key for user:', user.id);
          continue;
        }
      }

      return { found: false };
    } catch (error) {
      return { found: false, error: error.message };
    }
  },

  getLatestUserDomain: async (userId) => {
    try {
      const domain = await prisma.domain.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          domain: true,
          pathPrefix: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return { success: true, domain };
    } catch (error) {
      console.error('Error fetching latest user domain:', error.message);
      return { success: false, error: error.message, domain: null };
    }
  }
};
