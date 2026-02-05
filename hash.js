const bcrypt = require('bcrypt');

async function generateHash(password) {
  try {
    const saltRounds = 10; // Must match the saltRounds in server.js
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Generated Hash:', hash);
    return hash;
  } catch (err) {
    console.error('Error generating hash:', err);
  }
}

// Replace 'your_admin_password_here' with the password you want for the admin
generateHash('1234');
