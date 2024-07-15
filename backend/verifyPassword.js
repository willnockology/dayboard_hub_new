const bcrypt = require('bcryptjs');

const verifyPassword = async () => {
  const password = 'newpassword'; // The password to verify
  const hashedPassword = '$2a$10$FMkvJr4eQdTlzwnVW3Okl.jDDpJl4HckBkOpp8lgWIA4e9We.Ww6G'; // The hashed password from the database

  // Manually hash the password again
  const salt = await bcrypt.genSalt(10);
  const newHashedPassword = await bcrypt.hash(password, salt);

  console.log('Original hashed password:', hashedPassword);
  console.log('Newly hashed password:', newHashedPassword);

  // Compare the provided password with the stored hashed password
  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log('Password match status:', isMatch);
};

verifyPassword();
