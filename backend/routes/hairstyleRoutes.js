const express = require('express');
const router = express.Router();
const { getHairstyles, createHairstyle } = require('../controllers/hairstyleController');

router.get('/', getHairstyles);
router.post('/', createHairstyle);

module.exports = router;
