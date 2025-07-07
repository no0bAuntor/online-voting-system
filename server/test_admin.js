const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test admin credentials
const adminUsername = '789456';
const adminPassword = '@dmin';

console.log('Testing admin credentials:');
console.log('Username:', adminUsername);
console.log('Password:', adminPassword);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Test JWT creation
try {
  const token = jwt.sign({ id: 'admin' }, process.env.JWT_SECRET);
  console.log('JWT Token created successfully:', token);
} catch (error) {
  console.error('Error creating JWT token:', error);
}

// Test comparison
if (adminUsername === '789456' && adminPassword === '@dmin') {
  console.log('✅ Admin credentials match hardcoded values');
} else {
  console.log('❌ Admin credentials do not match');
}
