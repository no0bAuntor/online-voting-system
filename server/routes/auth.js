const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // 🚫 Prevent admin ID from being used in registration
  if (username === '789456') {
    return res.status(403).json({ message: 'Username reserved for admin' });
  }

  try {
    // ✅ Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
    }

    // ✅ Check if password is already used by another user
    const allUsers = await User.find({});
    for (const user of allUsers) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        return res.status(400).json({ message: 'This password is already in use. Please choose a different password.' });
      }
    }

    // ✅ Additional validation
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username: username.trim(), password: hashed });
    await user.save();

    res.json({ message: 'Registration successful!' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering user. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // ✅ Hardcoded admin credentials check
  if (username === '789456' && password === '@dmin') {
    const token = jwt.sign({ id: 'admin' }, process.env.JWT_SECRET);
    return res.json({ token, isAdmin: true });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, isAdmin: false });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router;
