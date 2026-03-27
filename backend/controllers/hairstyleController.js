const Hairstyle = require('../models/Hairstyle');

// @desc    Get all hairstyles
// @route   GET /api/hairstyles
// @access  Public
const getHairstyles = async (req, res) => {
  try {
    const hairstyles = await Hairstyle.find({});
    res.json(hairstyles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a hairstyle
// @route   POST /api/hairstyles
// @access  Private/Admin
const createHairstyle = async (req, res) => {
  try {
    const { name, description, image, price, category } = req.body;
    const hairstyle = await Hairstyle.create({
      name,
      description,
      image,
      price,
      category,
    });
    res.status(201).json(hairstyle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getHairstyles,
  createHairstyle,
};
