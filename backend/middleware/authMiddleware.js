const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const superuser = (req, res, next) => {
  if (req.user && req.user.role === 'Superuser') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a superuser');
  }
};

const userOrSuperuser = (req, res, next) => {
  if (req.user && (req.user.role === 'Superuser' || req.user.role === 'Company User' || req.user.role === 'Captain' || req.user.role === 'Crew')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a user');
  }
};

module.exports = { protect, superuser, userOrSuperuser };
