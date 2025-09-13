const express = require('express');
const Product = require('../models/Product');
const ProductQuantity = require('../models/ProductQuantity');
const Discount = require('../models/Discount');

const router = express.Router();

// Get all products with discounts applied
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

    // For each product, fetch its quantities and apply discounts
    const productsWithVariants = await Promise.all(products.map(async (product) => {
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

      if (quantities.length === 0) return null;

      // Apply discounts
      quantities = quantities.map(qty => {
        let discountedPrice = qty.price;
        
        // Find applicable discount
        const applicableDiscount = discounts.find(discount => {
          // If discount applies to all products or specific products
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

      // Group by color
      const variantsMap = {};
      quantities.forEach(qty => {
        if (!variantsMap[qty.colour]) {
          variantsMap[qty.colour] = {
            colour: qty.colour,
            price: qty.originalPrice,
            discountedPrice: qty.discountedPrice,
            images: qty.images || [],
            sizes: []
          };
        }
        variantsMap[qty.colour].sizes.push({
          size: qty.size,
          qty: qty.qty,
          productQuantityId: qty._id
        });
      });

      const variants = Object.values(variantsMap);
      
      return {
        ...product.toObject(),
        variants
      };
    }));

    // Filter out products with no variants (due to price filtering)
    const filteredProducts = productsWithVariants.filter(product => product !== null);

    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;