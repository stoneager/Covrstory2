const express = require('express');
const Collection = require('../models/Collection');

const router = express.Router();

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find().sort({ name: 1 });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;