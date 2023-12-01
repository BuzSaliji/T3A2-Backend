const mongoose = require('mongoose');

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
});

const Court = mongoose.model('Court', courtSchema);

module.exports = Court;