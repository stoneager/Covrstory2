const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema);
