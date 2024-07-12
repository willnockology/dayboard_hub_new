const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, password, role, email } = req.body;

  console.log('Request Body:', req.body); // Debugging log

  if (!username || !password || !role || !email) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Hashed Password: ${hashedPassword}`); // Debugging log

  const user = await User.create({
    username,
    password: hashedPassword,
    role,
    email,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  console.log(`Attempting login for ${username}`); // Debugging log

  const user = await User.findOne({ username });

  if (user) {
    console.log(`User found: ${user.username}`); // Debugging log
    console.log(`Entered password: ${password}`); // Debugging log
    console.log(`Stored password: ${user.password}`); // Debugging log

    const isPasswordMatch = await user.matchPassword(password);
    console.log(`Password match: ${isPasswordMatch}`); // Debugging log

    if (isPasswordMatch) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid username or password');
    }
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
