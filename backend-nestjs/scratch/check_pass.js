const bcrypt = require('bcryptjs');

async function testPassword() {
  const hash = '$2b$10$GH5gJaunqmbcYtYAiC9moOn2IRxfrkvKBXKn7CzU3/1isUoWEh5cy';
  const isValid = await bcrypt.compare('admin123', hash);
  console.log('Is valid?', isValid);
  
  if (!isValid) {
    const newHash = await bcrypt.hash('admin123', 10);
    console.log('New hash for admin123:', newHash);
  }
}

testPassword();
