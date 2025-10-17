const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    sparse: true
  },
  jwt_token: {
    type: String
  },
  role: {
    type: String,
    enum: ['customer', 'owner'],
    default: 'customer'
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
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true
  },
  // Phone auth fields
  phoneNumber: {
    type: String,
    sparse: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);