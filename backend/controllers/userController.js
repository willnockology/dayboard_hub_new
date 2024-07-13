const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Vessel = require('../models/vesselModel'); // Import Vessel model
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).populate('assignedVessels');

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match for ${username}: ${isMatch}`);

    if (isMatch) {
      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          assignedVessels: user.assignedVessels,
        },
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

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password, role, assignedVessels } = req.body;

  // Check if the required fields are provided
  if (!firstName || !lastName || !username || !email || !password || !role) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash the password before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log(`Hashed password for ${username}: ${hashedPassword}`);

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword, // Save the hashed password
    role,
    assignedVessels,
  });

  if (user) {
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        email: user.email,
        assignedVessels: user.assignedVessels,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('assignedVessels');

  if (user) {
    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      email: user.email,
      assignedVessels: user.assignedVessels,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Superuser
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().populate('assignedVessels');
  const vessels = await Vessel.find();

  const updatedUsers = users.map(user => {
    if (user.role === 'Superuser') {
      user.assignedVessels = vessels;
    }
    return user;
  });

  res.json(updatedUsers);
});

// @desc    Update user vessels
// @route   PUT /api/users/:id/vessels
// @access  Private/Superuser
const updateUserVessels = asyncHandler(async (req, res) => {
  const { vessels } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.assignedVessels = vessels;
  await user.save();

  res.json(user);
});

module.exports = { authUser, registerUser, getUserProfile, getUsers, updateUserVessels };
