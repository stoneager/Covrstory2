const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// @route   GET api/orders/my
// @desc    Get all orders for the logged-in customer except pending ones
// @access  Private
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      stages: { $ne: 'pending' }
    }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;