const mongoose = require('mongoose');

const hairstyleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a hairstyle name'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a base price'],
    },
    category: {
      type: String,
      enum: ['Short', 'Medium', 'Long', 'Beard', 'Special'],
      default: 'Short',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hairstyle', hairstyleSchema);
