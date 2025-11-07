const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const encryption = require('../utils/encryption');
const apiKeysService = require('./apiKeysService');
const apiKeysGenerator = require('../utils/apiKeysGenerator');

const JWT_SECRET = process.env.JWT_SECRET || 'ziptie-dev-secret';
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

const toSafeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  publicKey: user.publicKey,
});

const generateToken = (userId) =>
  jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

module.exports = {
  signup: async ({ email, password, name }) => {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
      }
    });

    const token = generateToken(user.id);

    return {
      user: toSafeUser(user),
      token,
    };
  },

  login: async ({ email, password }) => {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id);

    return {
      user: toSafeUser(user),
      token,
    };
  },

  getProfile: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        domains: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    let decryptedPublicKey = null;
    let decryptedPrivateKey = null;

    if (user.publicKey) {
      try {
        decryptedPublicKey = encryption.decrypt(user.publicKey);
      } catch (error) {
        console.error('Failed to decrypt public key:', error.message);
      }
    }

    if (user.privateKey) {
      try {
        decryptedPrivateKey = encryption.decrypt(user.privateKey);
      } catch (error) {
        console.error('Failed to decrypt private key:', error.message);
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      publicKey: decryptedPublicKey,
      privateKey: decryptedPrivateKey,
      domains: user.domains.map((domain) => ({
        id: domain.id,
        domain: domain.domain,
        pathPrefix: domain.pathPrefix,
        createdAt: domain.createdAt
      })),
      createdAt: user.createdAt
    };
  },

  upsertDomain: async ({ userId, domainId, domain, pathPrefix }) => {
    const sanitizedDomain = domain.trim().toLowerCase();

    if (!sanitizedDomain) {
      throw new Error('Domain is required');
    }

    if (domainId) {
      const existing = await prisma.domain.findUnique({
        where: { id: domainId }
      });

      if (!existing || existing.userId !== userId) {
        throw new Error('Domain not found');
      }

      const updated = await prisma.domain.update({
        where: { id: domainId },
        data: {
          domain: sanitizedDomain,
          pathPrefix: pathPrefix?.trim() || null
        }
      });

      return updated;
    }

    const created = await prisma.domain.create({
      data: {
        userId,
        domain: sanitizedDomain,
        pathPrefix: pathPrefix?.trim() || null
      }
    });

    return created;
  }
};
