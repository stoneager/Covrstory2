const express = require('express');
const Cart = require('../models/Cart');
const ProductQuantity = require('../models/ProductQuantity');
const { auth, customerOnly } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', auth, customerOnly, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.productQuantity',
        populate: {
          path: 'product',
          populate: {
            path: 'collection'
          }
        }
      });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/add', auth, customerOnly, async (req, res) => {
  try {
    const { productQuantityId, quantity } = req.body;

    // Verify product quantity exists and has stock
    const productQuantity = await ProductQuantity.findById(productQuantityId);
    if (!productQuantity) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (productQuantity.qty < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productQuantity.toString() === productQuantityId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].qty + quantity;
      if (productQuantity.qty < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      cart.items[existingItemIndex].qty = newQuantity;
    } else {
      // Add new item
      cart.items.push({ productQuantity: productQuantityId, qty: quantity });
    }

    await cart.save();
    
    // Populate and return updated cart
    cart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productQuantity',
        populate: {
          path: 'product',
          populate: {
            path: 'collection'
          }
        }
      });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update item quantity
router.put('/update', auth, customerOnly, async (req, res) => {
  try {
    const { productQuantityId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Verify stock
    const productQuantity = await ProductQuantity.findById(productQuantityId);
    if (!productQuantity) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (productQuantity.qty < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productQuantity.toString() === productQuantityId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].qty = quantity;
    await cart.save();

    // Populate and return updated cart
    cart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productQuantity',
        populate: {
          path: 'product',
          populate: {
            path: 'collection'
          }
        }
      });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productQuantityId', auth, customerOnly, async (req, res) => {
  try {
    const { productQuantityId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.productQuantity.toString() !== productQuantityId
    );

    await cart.save();

    // Populate and return updated cart
    cart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productQuantity',
        populate: {
          path: 'product',
          populate: {
            path: 'collection'
          }
        }
      });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/clear', auth, customerOnly, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    } else {
      cart.items = [];
    }
    
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;