const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true, // Optional for now, but good for tracking
    },
    service: {
      type: String,
      required: [true, 'Please specify a service'],
      // enum: ['Classic Haircut', 'Beard Trim & Shaping', 'Premium Styling', 'Hot Towel Shave'],
    },
    date: {
      type: Date,
      required: [true, 'Please pick a date'],
    },
    time: {
      type: String,
      required: [true, 'Please pick a time slot'],
    },
    bookingType: {
      type: String,
      enum: ['in-shop', 'home-call'],
      default: 'in-shop',
      required: true,
    },
    address: {
      type: String,
      // required for home-call in application logic
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
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
