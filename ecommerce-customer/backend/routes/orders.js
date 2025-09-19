const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, customerOnly } = require('../middleware/auth');

router.get('/my', auth, customerOnly, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items.productQuantity',
        populate: {
          path: 'product',
          select: 'name type gender activity collection'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
