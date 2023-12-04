const express = require('express');
const { Booking } = require('../models/BookingModel');
const authMiddleware = require('../functions/authMiddleware');


const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
  }
  next();
};


// Get all bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific booking by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new booking
// Create a new booking
router.post('/', authMiddleware, async (req, res) => {
  try {
      const { userId, courtId, date, startTime, endTime } = req.body;

      // Basic validation
      if (!userId || !courtId || !date || !startTime || !endTime) {
          return res.status(400).json({ error: 'All fields are required.' });
      }

      // Convert date strings to Date objects
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      // Check if the court is already booked for the given time slot
      const existingBooking = await Booking.findOne({
          court: courtId,
          date,
          $or: [
              { 'timeSlot.start': { $lte: startDate }, 'timeSlot.end': { $gte: startDate } },
              { 'timeSlot.start': { $lte: endDate }, 'timeSlot.end': { $gte: endDate } },
              { 'timeSlot.start': { $gte: startDate }, 'timeSlot.end': { $lte: endDate } }
          ]
      });

      if (existingBooking) {
          return res.status(400).json({ error: 'Court is already booked for this time slot.' });
      }

      // Create the booking
      const newBooking = await Booking.create({ 
        user: userId, 
        court: courtId, 
        date, 
        timeSlot: { start: startDate, end: endDate } 
    });
      res.json(newBooking);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


// Update a booking
router.patch('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a booking
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
