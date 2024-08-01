const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: false,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: false,
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
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
