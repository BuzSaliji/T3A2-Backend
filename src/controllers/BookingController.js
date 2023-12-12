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

// Get bookings by court and date range
router.get('/by-court', authMiddleware, async (req, res) => {
  try {
    const { courtId, startDate, endDate } = req.query;

    // Validate input
    if (!courtId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Court ID, start date, and end date are required.' });
    }

    // Adjust startDate and endDate to cover the full day
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0); // Set to beginning of the day

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

    // Fetch bookings
    const bookings = await Booking.find({
      court: courtId,
      date: { $gte: startOfDay, $lte: endOfDay },
      $or: [
        { 'timeSlot.start': { $lte: endOfDay } },
        { 'timeSlot.end': { $gte: startOfDay } }
      ]
    }).populate('court');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Get a specific booking by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
                                      .populate('user', 'username')
                                      .populate('court');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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