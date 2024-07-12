// generateHash.js
const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(hash);
}

generateHash('your_superuser_password'); // Replace with your desired superuser password
