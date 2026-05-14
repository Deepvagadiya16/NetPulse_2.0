const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const mockStore = require('../mockStore');
const { isDatabaseConnected } = require('../utils/dbState');

const protect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const dbConnected = isDatabaseConnected();

      let user = null;

      if (dbConnected) {
        try {
          user = await User.findById(decoded.id).select('-password');
        } catch (dbError) {
          console.error('DB User Lookup Error:', dbError.message);
        }
      }

      // FALLBACK TO MOCK DATA: If user not found in DB or DB not connected
      if (!user) {
        user = mockStore.toPublicUser(mockStore.getUserById(decoded.id));
      }

      // SECOND FALLBACK: If still not found but token has role/info (for loose mock data)
      if (!user && decoded.role) {
        user = {
          _id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        };
      }

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user?.role || 'unknown'} is not authorized to access this route`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
