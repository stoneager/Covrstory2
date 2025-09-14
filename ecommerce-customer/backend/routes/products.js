const express = require('express');
const Product = require('../models/Product');
const ProductQuantity = require('../models/ProductQuantity');
const Discount = require('../models/Discount');

const router = express.Router();

// Get all products with productQuantities and discounts applied
router.get('/', async (req, res) => {
  try {
    const { search, collection, type, gender, minPrice, maxPrice } = req.query;

    // Build product filter
    let productFilter = {};
    if (search) {
      productFilter.name = { $regex: search, $options: 'i' };
    }
    if (collection) {
      productFilter.collection = collection;
    }
    if (type) {
      productFilter.type = type;
    }
    if (gender) {
      productFilter.gender = gender;
    }

    const products = await Product.find(productFilter)
      .populate('collection')
      .sort({ createdAt: -1 });

    // Get active discounts
    const discounts = await Discount.find({ isActive: true });

    // For each product, fetch its productQuantities and apply discounts
    const productsWithQuantities = await Promise.all(products.map(async (product) => {
      let quantities = await ProductQuantity.find({ product: product._id });

      // Apply price filters
      if (minPrice || maxPrice) {
        quantities = quantities.filter(qty => {
          const price = qty.price;
          if (minPrice && price < parseFloat(minPrice)) return false;
          if (maxPrice && price > parseFloat(maxPrice)) return false;
          return true;
        });
      }

      // Apply discounts
      quantities = quantities.map(qty => {
        let discountedPrice = qty.price;
        const applicableDiscount = discounts.find(discount => {
          return discount.products.length === 0 ||
                 discount.products.some(p => p.toString() === product._id.toString());
        });
        if (applicableDiscount) {
          discountedPrice = qty.price * (1 - applicableDiscount.discount_percent / 100);
        }
        return {
          ...qty.toObject(),
          discountedPrice: Math.round(discountedPrice),
          originalPrice: qty.price,
          hasDiscount: discountedPrice < qty.price
        };
      });

      return {
        ...product.toObject(),
        productQuantities: quantities
      };
    }));

    // Filter out products with no productQuantities (due to price filtering)
    const filteredProducts = productsWithQuantities.filter(product => product.productQuantities.length > 0);

    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;