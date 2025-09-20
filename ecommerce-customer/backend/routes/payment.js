const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const ProductQuantity = require('../models/ProductQuantity');
const { auth, customerOnly } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', auth, customerOnly, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment_status === 'completed') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${orderId}`,
      payment_capture: 1
    });

    // Update order with Razorpay order ID
    order.razorpay_order_id = razorpayOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// Verify payment
router.post('/verify', auth, customerOnly, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Update order
    const order = await Order.findOne({ _id: orderId, user: req.user._id })
      .populate('items.productQuantity');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (expectedSignature !== razorpay_signature) {
      // Mark payment as failed on the same order
      order.payment_status = 'failed';
      order.stages = 'pending';
      await order.save();
      return res.status(400).json({ success: false, message: 'Invalid signature. Payment failed.' });
    }

    order.payment_status = 'completed';
    order.razorpay_payment_id = razorpay_payment_id;
    order.stages = 'confirmed';
    await order.save();

    // Update stock quantities
    for (const item of order.items) {
      await ProductQuantity.findByIdAndUpdate(
        item.productQuantity._id,
        { $inc: { qty: -item.qty } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    );

    // Add order to user's order history
    await req.user.updateOne({
      $addToSet: { orderHistory: order._id }
    });

    res.json({ success: true, orderId: order._id });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router;