const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productQuantity: [{
    productQuantity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductQuantity',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  reason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'PickedUp', 'Completed', 'Rejected'],
    default: 'Requested'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field on save
ReturnSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Return', ReturnSchema);