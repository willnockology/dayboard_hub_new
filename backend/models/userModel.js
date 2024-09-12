const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,  // Last name should typically be required
  },
  username: {
    type: String,
    required: true,  // Username should be required for unique identification
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,  // Password should be required
  },
  role: {
    type: String,
    required: true,  // Role should be required to define user permissions
  },
  assignedVessels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vessel',
    },
  ],
  phoneNumber: {
    type: String,
    required: false,
  },
  birthday: {
    type: Date,
    required: false,
  },
  startDate: {
    type: Date,
    required: false,
  },
  position: {
    type: String,
    required: false,
  },
  commercial: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: String, // Stores the URL or file path of the user's profile picture
    required: false,
  },
  nationality: {
    type: String,
    required: false,
  },
  embarked: {
    type: Date,
    required: false,
  },
  passportNumber: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Method to match user-entered password to hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to hash password before saving user data
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a salt
  const salt = await bcrypt.genSalt(10);
  // Hash the password using the salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
