const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mobile: {
    type: String
  },
  address: {
    line1: String,
    area: String,
    city: String,
    pincode: String
  },
  items: [{
    productQuantity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductQuantity'
    },
    qty: Number,
    price: Number, // Snapshot price
    productName: String,
    size: String,
    colour: String
  }],
  total_mrp: {
    type: Number,
    required: true
  },
  coupon_code: {
    type: String,
    default: null
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  final_amount: {
    type: Number,
    required: true
  },
  stages: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  razorpay_order_id: {
    type: String
  },
  razorpay_payment_id: {
    type: String
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);