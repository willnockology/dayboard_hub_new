const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Vessel = require('../models/vesselModel');
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

  try {
    console.log('Login attempt for username:', username);
    const user = await User.findOne({ username }).populate('assignedVessels');

    if (user) {
      console.log('User found:', user);
      console.log('Password provided:', password);
      console.log('Hashed password in DB:', user.password);

      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match status:', isMatch);

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
        console.log('Password mismatch');
        res.status(401).json({ message: 'Invalid username or password' });
      }
    } else {
      console.log('User not found');
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password, role, assignedVessels } = req.body;

  if (!firstName || !lastName || !username || !email || !password || !role) {
    res.status(400).json({ message: 'Please fill in all fields' });
    return;
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Generated hashed password during registration:', hashedPassword);

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role,
      assignedVessels,
    });

    await user.save();
    console.log('User saved with hashed password:', user.password);

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
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error during user registration' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
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
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error during fetching user profile' });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Superuser
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().populate('assignedVessels');
    const vessels = await Vessel.find();

    const updatedUsers = users.map(user => {
      if (user.role === 'Superuser') {
        user.assignedVessels = vessels;
      }
      return user;
    });

    res.json(updatedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error during fetching users' });
  }
});

// @desc    Update user vessels
// @route   PUT /api/users/:id/vessels
// @access  Private/Superuser
const updateUserVessels = asyncHandler(async (req, res) => {
  try {
    const { vessels } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.assignedVessels = vessels;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error updating user vessels:', error);
    res.status(500).json({ message: 'Server error during updating user vessels' });
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  getUsers,
  updateUserVessels,
};
