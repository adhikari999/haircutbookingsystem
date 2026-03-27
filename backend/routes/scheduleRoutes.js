const express = require('express');
const router = express.Router();
const { getSchedules, getBarbers, updateSchedule } = require('../controllers/scheduleController');
// const { protect, barber } = require('../middleware/authMiddleware'); // Assuming these exist

router.get('/', getSchedules);
router.get('/barbers', getBarbers);
router.post('/', updateSchedule); // Add protection middleware if available

module.exports = router;
