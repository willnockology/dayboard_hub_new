const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
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
    type: String,
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
}, {
  timestamps: true,
});

// Method to match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
