const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { service, date, time, totalPrice, barber, bookingType, address } = req.body;

    if (!service || !date || !time || !totalPrice || !bookingType) {
      return res.status(400).json({ message: 'Please provide all booking details' });
    }

    if (bookingType === 'home-call' && !address) {
      return res.status(400).json({ message: 'Address is required for home calls' });
    }

    // Check for overlap (Simple check: same barber, date, time)
    // If no barber is selected, we check general overlap for simplicity, 
    // but in a multi-barber system we should check per barber.
    const query = { date, time, status: { $ne: 'cancelled' } };
    if (barber) query.barber = barber;
    
    const existingBooking = await Booking.findOne(query);
    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked. Please choose another one.' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      barber,
      service,
      date,
      time,
      bookingType,
      address,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ date: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Barber/Admin)
// @route   GET /api/bookings/all
// @access  Private (Barber/Admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email phone').sort({ date: 1, time: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Barber Stats
// @route   GET /api/bookings/stats
// @access  Private (Barber/Admin)
const getBarberStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const revenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      totalBookings,
      completedBookings,
      pendingBookings,
      revenue: revenue[0] ? revenue[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  getBarberStats,
  updateBookingStatus
};
