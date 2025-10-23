const prisma = require('../lib/prisma');

module.exports = {
  findUserByPublicKey: async (publicKey) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          apiKey: publicKey
        },
        select: {
          id: true,
          email: true,
          name: true,
          apiKey: true,
          createdAt: true
        }
      });

      if (!user) {
        return { found: false };
      }

      return { found: true, user };
    } catch (error) {
      return { found: false, error: error.message };
    }
  }
};
