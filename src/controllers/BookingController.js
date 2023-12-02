const express = require('express');
const { Booking } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const bookings = await Booking.findAll();
  res.json(bookings);
});

router.post('/', async (req, res) => {
    const booking = await Booking.create(req.body);
    res.json(booking);
});

router.get('/:id', async (req, res) => {
    const booking = await Booking.findByPk(req.params.id);
    res.json(booking);
});

router.patch('/:id', async (req, res) => {
    await Booking.update(req.body, {
        where: { id: req.params.id }
    });
    res.json({ success: 'Booking updated' });
});

module.exports = router;