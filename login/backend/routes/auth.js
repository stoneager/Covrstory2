const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const { sendVerificationCode } = require('../services/emailService');

const router = express.Router();

// Login/Register
router.post('/login', async (req, res) => {
  try {
    const { email, name, authType, googleId, phoneNumber } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        role: 'customer', // Default role
        googleId: authType === 'google' ? googleId : undefined,
        phoneNumber: authType === 'phone' ? phoneNumber : undefined,
        isPhoneVerified: authType === 'phone' ? true : false
      });
      await user.save();
    } else {
      // Update existing user with new auth method if needed
      if (authType === 'google' && !user.googleId) {
        user.googleId = googleId;
      }
      if (authType === 'phone' && !user.phoneNumber) {
        user.phoneNumber = phoneNumber;
        user.isPhoneVerified = true;
      }
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists. Please login.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await VerificationCode.findOneAndDelete({ email });

    const verificationCode = new VerificationCode({
      email,
      code,
      expiresAt
    });
    await verificationCode.save();

    const emailResult = await sendVerificationCode(email, code);

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
    }

    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const verificationCode = await VerificationCode.findOne({ email, code });

    if (!verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > verificationCode.expiresAt) {
      await VerificationCode.findOneAndDelete({ email });
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/register-email', async (req, res) => {
  try {
    const { email, password, confirmPassword, name, role } = req.body;

    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer'
    });
    await user.save();

    await VerificationCode.findOneAndDelete({ email });

    res.json({ message: 'Registration successful! Please login.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/login-email', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'This account uses a different login method. Please try Google or Phone login.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;