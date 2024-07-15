const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel'); // Adjust the path as needed

const updatePassword = async () => {
  await mongoose.connect('mongodb+srv://willnock:ux7rr3SYGwTXrobV@db.fuk3snj.mongodb.net/dayboard_hub?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

  const user = await User.findOne({ username: 'company' });
  if (user) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash('newpassword123', salt); // Set a known password
    await user.save();
    console.log('Password updated successfully');
  } else {
    console.log('User not found');
  }

  mongoose.disconnect();
};

updatePassword();
