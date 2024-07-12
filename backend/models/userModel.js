const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin', 'superuser']
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log(`Password match for ${this.username}: ${isMatch}`); // Debugging log
  return isMatch;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
