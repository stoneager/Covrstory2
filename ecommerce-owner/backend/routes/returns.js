const express = require('express');
const Return = require('../models/Return');
const Order = require('../models/Order');
const { dummyAuth, ownerOnly } = require('../middleware/auth');

const router = express.Router();

// Get all returns (admin)
router.get('/', dummyAuth, ownerOnly, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const returns = await Return.find(filter)
      .populate('userId', 'name email')
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

// Update return status
router.patch('/:id/status', dummyAuth, ownerOnly, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Requested', 'Approved', 'PickedUp', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const returnRequest = await Return.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'name email')
     .populate('orderId')
     .populate({
       path: 'productQuantity.productQuantity',
       populate: {
         path: 'product',
         select: 'name'
       }
     });

    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    res.json(returnRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;