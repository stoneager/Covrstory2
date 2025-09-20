const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {auth} = require('../middleware/auth');

// Update user info (mobile, address)
router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { mobile, address } = req.body;
    if (!mobile || !address || !address.line1 || !address.area || !address.city || !address.pincode) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { mobile, address },
      { new: true }
    );
    
    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User info updated successfully.', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
