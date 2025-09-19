const express = require('express');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const ProductQuantity = require('../models/ProductQuantity');
const { auth, customerOnly } = require('../middleware/auth');

const router = express.Router();

// Apply coupon
router.post('/apply-coupon', auth, customerOnly, async (req, res) => {
  try {
    const { couponCode, amount } = req.body;

    const coupon = await Coupon.findOne({ 
      couponCode: couponCode.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.json({ valid: false, message: 'Invalid coupon code' });
    }

    // Check if user has already used this coupon
    if (coupon.used_ids.includes(req.user._id)) {
      return res.json({ valid: false, message: 'Coupon already used' });
    }

    // Check if coupon is applicable to this user
    if (coupon.applicable.length > 0 && !coupon.applicable.includes(req.user._id)) {
      return res.json({ valid: false, message: 'Coupon not applicable to your account' });
    }

    // Check price conditions
    if (coupon.price_condition.low && amount < coupon.price_condition.low) {
      return res.json({ 
        valid: false, 
        message: `Minimum order amount should be ₹${coupon.price_condition.low}` 
      });
    }

    if (coupon.price_condition.up && amount > coupon.price_condition.up) {
      return res.json({ 
        valid: false, 
        message: `Maximum order amount should be ₹${coupon.price_condition.up}` 
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.red_price) {
      discount = coupon.red_price;
    } else if (coupon.red_percent) {
      discount = Math.round((amount * coupon.red_percent) / 100);
    }

    // Ensure discount doesn't exceed order amount
    discount = Math.min(discount, amount);

    res.json({ 
      valid: true, 
      discount,
      couponCode: coupon.couponCode
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/create-order', auth, customerOnly, async (req, res) => {
  try {
    const { items, subtotal, couponCode, discount, total } = req.body;

    // Verify cart items and stock
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.productQuantity');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify stock availability
    for (const cartItem of cart.items) {
      if (cartItem.productQuantity.qty < cartItem.qty) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${cartItem.productQuantity.product?.name}` 
        });
      }
    }

    // Create order items with snapshot data
    const orderItems = cart.items.map(item => ({
      productQuantity: item.productQuantity._id,
      qty: item.qty,
      price: item.productQuantity.price,
      productName: item.productQuantity.product?.name,
      size: item.productQuantity.size,
      colour: item.productQuantity.colour
    }));

    // Check for existing pending order for this user and cart
    const existingOrder = await Order.findOne({
      user: req.user._id,
      stages: 'pending',
      payment_status: 'pending',
      total_mrp: subtotal,
      final_amount: total,
      coupon_code: couponCode || null,
      discount_amount: discount || 0
    });

    let order;
    if (existingOrder) {
      // Optionally update items if cart changed
      existingOrder.items = orderItems;
      await existingOrder.save();
      order = existingOrder;
    } else {
      order = new Order({
        user: req.user._id,
        items: orderItems,
        total_mrp: subtotal,
        coupon_code: couponCode || null,
        discount_amount: discount || 0,
        final_amount: total,
        stages: 'pending',
        payment_status: 'pending'
      });
      await order.save();
    }

    // If coupon was used, mark it as used
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { couponCode: couponCode.toUpperCase() },
        { $addToSet: { used_ids: req.user._id } }
      );
    }

    res.json({
      orderId: order._id,
      user: {
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;