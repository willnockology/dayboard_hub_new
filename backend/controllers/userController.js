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
    const user = await User.findOne({ username }).populate('assignedVessels');

    if (user && await user.matchPassword(password)) {
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
          phoneNumber: user.phoneNumber,
          birthday: user.birthday,
          startDate: user.startDate,
          position: user.position,
          commercial: user.commercial,
        },
      });
    } else {
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
  const { firstName, lastName, username, email, password, role, assignedVessels, phoneNumber, birthday, startDate, position, commercial } = req.body;

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

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      assignedVessels,
      phoneNumber,
      birthday,
      startDate,
      position,
      commercial,
    });

    await user.save();

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
          phoneNumber: user.phoneNumber,
          birthday: user.birthday,
          startDate: user.startDate,
          position: user.position,
          commercial: user.commercial,
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
        phoneNumber: user.phoneNumber,
        birthday: user.birthday,
        startDate: user.startDate,
        position: user.position,
        commercial: user.commercial,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error during fetching user profile' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.birthday = req.body.birthday || user.birthday;
    user.startDate = req.body.startDate || user.startDate;
    user.position = req.body.position || user.position;
    user.commercial = req.body.commercial !== undefined ? req.body.commercial : user.commercial;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      role: updatedUser.role,
      email: updatedUser.email,
      assignedVessels: updatedUser.assignedVessels,
      phoneNumber: updatedUser.phoneNumber,
      birthday: updatedUser.birthday,
      startDate: updatedUser.startDate,
      position: updatedUser.position,
      commercial: updatedUser.commercial,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
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
    const { vessels, commercial } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.assignedVessels = vessels;
    if (commercial !== undefined) {
      user.commercial = commercial;
    }

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
  updateUserProfile,
  getUsers,
  updateUserVessels,
};
