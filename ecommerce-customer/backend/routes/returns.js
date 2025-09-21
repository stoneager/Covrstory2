const express = require('express');
const Return = require('../models/Return');
const Order = require('../models/Order');
const { auth, customerOnly } = require('../middleware/auth');

const router = express.Router();

// Create return request
router.post('/', auth, customerOnly, async (req, res) => {
  try {
    
    const { orderId, productQuantity, reason } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user._id,
      stages: 'Delivered'
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not eligible for return' });
    }

    // Check if order was delivered within last 7 days
    const deliveryDate = order.updatedAt;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    if (deliveryDate < sevenDaysAgo) {
      return res.status(400).json({ message: 'Return period has expired. Returns are only available within 7 days of delivery.' });
    }

    // Check if return request already exists for this order
    const existingReturn = await Return.findOne({ orderId, userId: req.user._id });
    if (existingReturn) {
      return res.status(400).json({ message: 'Return request already exists for this order' });
    }

    const returnRequest = new Return({
      orderId,
      userId: req.user._id,
      productQuantity,
      reason: reason || ''
    });

    await returnRequest.save();
    
    const populatedReturn = await Return.findById(returnRequest._id)
      .populate('orderId')
      .populate('productQuantity.productQuantity');

    res.status(201).json(populatedReturn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/check/:orderId', auth, customerOnly, async (req, res) => {
  try {
    const { orderId } = req.params;
    const returnRequest = await Return.findOne({ orderId, userId: req.user._id });
    
    res.json({ exists: !!returnRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer's returns
router.get('/me', auth, customerOnly, async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.user._id })
      .populate('orderId')
      .populate({
        path: 'productQuantity.productQuantity',
        populate: {
          path: 'product',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ returns });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;