const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    court: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        }
    },
    // Additional attributes like booking status, payment details, etc., can be added here
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Booking };