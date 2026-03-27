const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Hairstyle = require('../models/Hairstyle');

// ---- Users ----
// GET all users
router.get('/users', protect, admin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// DELETE user
router.delete('/users/:id', protect, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// ---- Barber Verification ----
// GET all unverified barbers
router.get('/barbers/pending', protect, admin, async (req, res) => {
  const barbers = await User.find({ role: 'barber', isVerified: false }).select('-password');
  res.json(barbers);
});

// GET all verified barbers
router.get('/barbers', protect, admin, async (req, res) => {
  const barbers = await User.find({ role: 'barber' }).select('-password');
  res.json(barbers);
});

// PUT verify barber
router.put('/barbers/:id/verify', protect, admin, async (req, res) => {
  const barber = await User.findById(req.params.id);
  if (!barber || barber.role !== 'barber') return res.status(404).json({ message: 'Barber not found' });
  barber.isVerified = true;
  await barber.save();
  res.json({ message: 'Barber verified', barber });
});

// PUT reject/unverify barber
router.put('/barbers/:id/reject', protect, admin, async (req, res) => {
  const barber = await User.findById(req.params.id);
  if (!barber || barber.role !== 'barber') return res.status(404).json({ message: 'Barber not found' });
  barber.isVerified = false;
  await barber.save();
  res.json({ message: 'Barber unverified' });
});

// ---- Bookings CRUD ----
// GET all bookings
router.get('/bookings', protect, admin, async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email phone')
    .populate('barber', 'name email')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// POST create booking (admin)
router.post('/bookings', protect, admin, async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update booking
router.put('/bookings/:id', protect, admin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE booking
router.delete('/bookings/:id', protect, admin, async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ message: 'Booking deleted' });
});

// ---- Hairstyles CRUD ----
// PUT update hairstyle
router.put('/hairstyles/:id', protect, admin, async (req, res) => {
  try {
    const hs = await Hairstyle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// DELETE hairstyle
router.delete('/hairstyles/:id', protect, admin, async (req, res) => {
  await Hairstyle.findByIdAndDelete(req.params.id);
  res.json({ message: 'Hairstyle deleted' });
});

// ---- Stats ----
router.get('/stats', protect, admin, async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'customer' });
  const totalBarbers = await User.countDocuments({ role: 'barber' });
  const pendingBarbers = await User.countDocuments({ role: 'barber', isVerified: false });
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({ status: 'pending' });
  const completedBookings = await Booking.countDocuments({ status: 'completed' });
  const revenueResult = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  res.json({
    totalUsers, totalBarbers, pendingBarbers,
    totalBookings, pendingBookings, completedBookings,
    revenue: revenueResult[0]?.total || 0
  });
});

module.exports = router;
