const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

module.exports = router;