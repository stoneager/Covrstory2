const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const Order = require('../models/Order');

// Get all packages (latest first)
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'orders',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new package with selected order IDs
router.post('/', async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    // Check if any orders are already in other packages
    const existingPackages = await Package.find({ orders: { $in: orderIds } });
    if (existingPackages.length > 0) {
      return res.status(400).json({ 
        message: 'Some orders are already assigned to other packages' 
      });
    }
    
    const pkg = new Package({ orders: orderIds });
    await pkg.save();
    // Link package to orders
    await Order.updateMany({ _id: { $in: orderIds } }, { package: pkg._id });
    res.status(201).json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update package orders
router.put('/:id', async (req, res) => {
  try {
    const { orderIds } = req.body;
    const packageId = req.params.id;
    
    // Get current package
    const currentPackage = await Package.findById(packageId);
    if (!currentPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Check if any new orders are already in other packages
    const newOrderIds = orderIds.filter(id => !currentPackage.orders.includes(id));
    if (newOrderIds.length > 0) {
      const existingPackages = await Package.find({ 
        _id: { $ne: packageId },
        orders: { $in: newOrderIds } 
      });
      if (existingPackages.length > 0) {
        return res.status(400).json({ 
          message: 'Some orders are already assigned to other packages' 
        });
      }
    }
    
    // Remove package reference from orders that are being removed
    const removedOrderIds = currentPackage.orders.filter(id => !orderIds.includes(id.toString()));
    if (removedOrderIds.length > 0) {
      await Order.updateMany(
        { _id: { $in: removedOrderIds } }, 
        { $unset: { package: 1 } }
      );
    }
    
    // Update package with new order list
    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      { orders: orderIds },
      { new: true }
    ).populate({
      path: 'orders',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
    // Update package reference in orders
    await Order.updateMany({ _id: { $in: orderIds } }, { package: packageId });
    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete package
router.delete('/:id', async (req, res) => {
  try {
    const packageId = req.params.id;
    
    // Get package to find associated orders
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Remove package reference from orders
    await Order.updateMany(
      { _id: { $in: pkg.orders } }, 
      { $unset: { package: 1 } }
    );
    
    // Delete the package
    await Package.findByIdAndDelete(packageId);
    
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update package status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    // Update package status
    const pkg = await Package.findByIdAndUpdate(req.params.id, { stages: status }, { new: true });
    if (pkg && pkg.orders && pkg.orders.length > 0) {
      // Update all orders in the package
      await Order.updateMany({ _id: { $in: pkg.orders } }, { stages: status });
    }
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
