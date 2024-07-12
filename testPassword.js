const bcrypt = require('bcryptjs');

const password = 'your_plaintext_password';
const hashedPassword = '$2a$10$Ksm3Fpoy1fxBJAgr.m7ER.E.TsxiIgRiEp5IBXNvAhlLDaokPsbgC'; // Use the hashed password from MongoDB

async function testPassword() {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log(`Password match: ${isMatch}`);
}

testPassword();
