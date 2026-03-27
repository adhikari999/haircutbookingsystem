const Schedule = require('../models/Schedule');
const User = require('../models/User');

// @desc    Get schedules for all barbers
// @route   GET /api/schedules
// @access  Public
const getSchedules = async (req, res) => {
  try {
    const { date, type } = req.query; // type can be 'home-call' or 'in-shop'
    const query = {};
    if (date) query.date = new Date(date);
    if (type === 'home-call') query.availableForHomeCall = true;

    const schedules = await Schedule.find(query).populate('barber', 'name email phone');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all barbers
// @route   GET /api/schedules/barbers
// @access  Public
const getBarbers = async (req, res) => {
  try {
    const barbers = await User.find({ role: 'barber' }).select('name email phone');
    res.json(barbers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create/Update schedule (for barbers)
// @route   POST /api/schedules
// @access  Private/Barber
const updateSchedule = async (req, res) => {
  try {
    const { date, timeSlots, availableForHomeCall } = req.body;
    const barberId = req.user._id; // Assuming auth middleware provides this

    let schedule = await Schedule.findOne({ barber: barberId, date: new Date(date) });

    if (schedule) {
      schedule.timeSlots = timeSlots || schedule.timeSlots;
      schedule.availableForHomeCall = availableForHomeCall !== undefined ? availableForHomeCall : schedule.availableForHomeCall;
      await schedule.save();
    } else {
      schedule = await Schedule.create({
        barber: barberId,
        date: new Date(date),
        timeSlots,
        availableForHomeCall,
      });
    }

    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getSchedules,
  getBarbers,
  updateSchedule,
};
