const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    start: Date,
    end: Date
}, { _id: false }); 

const courtSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    timeSlots: [timeSlotSchema] // Array of time slots
});

const Court = mongoose.model('Court', courtSchema);

module.exports = { Court };
