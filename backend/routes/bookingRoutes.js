const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  getBarberStats,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect, barber } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Barber routes
router.get('/all', protect, barber, getAllBookings);
router.get('/stats', protect, barber, getBarberStats);
router.put('/:id/status', protect, barber, updateBookingStatus);
router.delete('/:id', protect, barber, deleteBooking);

module.exports = router;
