const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Vessel = require('../models/vesselModel');

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
          photo: user.photo,
          nationality: user.nationality,
          embarked: user.embarked,
          passportNumber: user.passportNumber,
          active: user.active, // Ensure active status is included
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

// @desc    Register a new user or crew member
// @route   POST /api/users/register
// @access  Private (Superuser, Company user, Captain)
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password, role, assignedVessels, phoneNumber, birthday, startDate, position, commercial, photo, nationality, embarked, passportNumber, active } = req.body;

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

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role,
      assignedVessels,
      phoneNumber,
      birthday,
      startDate,
      position,
      commercial,
      photo,
      nationality,
      embarked,
      passportNumber,
      active, // Ensure active status is included
    });

    const createdUser = await newUser.save();

    if (createdUser) {
      res.status(201).json({
        token: generateToken(createdUser._id),
        user: {
          id: createdUser._id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          username: createdUser.username,
          role: createdUser.role,
          email: createdUser.email,
          assignedVessels: createdUser.assignedVessels,
          phoneNumber: createdUser.phoneNumber,
          birthday: createdUser.birthday,
          startDate: createdUser.startDate,
          position: createdUser.position,
          commercial: createdUser.commercial,
          photo: createdUser.photo,
          nationality: createdUser.nationality,
          embarked: createdUser.embarked,
          passportNumber: createdUser.passportNumber,
          active: createdUser.active, // Ensure active status is included
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
        photo: user.photo,
        nationality: user.nationality,
        embarked: user.embarked,
        passportNumber: user.passportNumber,
        active: user.active, // Ensure active status is included
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
// @route   PUT /api/users/:id/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  console.log('Update user profile request:', req.body); // Add logging
  try {
    const user = await User.findById(userId);

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
      user.photo = req.body.photo || user.photo;
      user.nationality = req.body.nationality || user.nationality;
      user.embarked = req.body.embarked || user.embarked;
      user.passportNumber = req.body.passportNumber || user.passportNumber;
      user.active = req.body.active !== undefined ? req.body.active : user.active; // Ensure active status is updated
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
        photo: updatedUser.photo,
        nationality: updatedUser.nationality,
        embarked: updatedUser.embarked,
        passportNumber: updatedUser.passportNumber,
        active: updatedUser.active, // Ensure active status is included
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error during updating user profile' });
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

// @desc    Get crew members
// @route   GET /api/users/crew
// @access  Private
const getCrewMembers = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('assignedVessels');
    let crewMembers;

    if (user.role === 'Superuser' || user.role === 'Company User') {
      crewMembers = await User.find({
        role: { $in: ['Captain', 'Crew'] }
      }).populate('assignedVessels');
    } else {
      crewMembers = await User.find({
        role: { $in: ['Captain', 'Crew'] },
        assignedVessels: { $in: user.assignedVessels }
      }).populate('assignedVessels');
    }

    res.json(crewMembers);
  } catch (error) {
    console.error('Error fetching crew members:', error);
    res.status(500).json({ message: 'Server error during fetching crew members' });
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
  getCrewMembers,
  updateUserVessels,
};
