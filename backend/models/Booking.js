const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    service: {
      type: String,
      required: [true, 'Please specify a service'],
      enum: ['Classic Haircut', 'Beard Trim & Shaping', 'Premium Styling', 'Hot Towel Shave'],
    },
    date: {
      type: Date,
      required: [true, 'Please pick a date'],
    },
    time: {
      type: String,
      required: [true, 'Please pick a time slot'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
