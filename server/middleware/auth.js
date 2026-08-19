const jwt = require('jsonwebtoken');

const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

const isAuthenticated = async (req, res, next) => {
  // First try JWT
  const token = extractToken(req);
  if (token) {
    const decoded = verifyJwtToken(token);
    if (decoded) {
      const User = require('../models/User');
      const user = await User.findById(decoded.id);
      if (user && !user.deletedAt) {
        req.user = user;
        return next();
      }
    }
  }

  // Fallback to Session
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
};

const isAdmin = async (req, res, next) => {
  // We can reuse isAuthenticated to populate req.user
  await isAuthenticated(req, res, (err) => {
    if (err) return next(err);
    // After isAuthenticated, req.user should be set
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  });
};

const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    const decoded = verifyJwtToken(token);
    if (decoded) {
      const User = require('../models/User');
      const user = await User.findById(decoded.id);
      if (user && !user.deletedAt) {
        req.user = user;
      }
    }
  } else if (req.isAuthenticated && req.isAuthenticated()) {
    // req.user is already populated by passport
  }
  return next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  optionalAuth
};
