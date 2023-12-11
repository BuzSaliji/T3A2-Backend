require('dotenv').config();

const mongoose = require('mongoose');
const { User } = require('./models/UserModel');
const { Court } = require('./models/CourtModel');
const { Booking } = require('./models/BookingModel');
const { databaseConnect } = require('./database');
const { hashPassword } = require('./functions/userAuthFunctions');

const seedData = async () => {
    console.log("Creating seed data!");

    // Clear existing data
    await User.deleteMany({});
    await Court.deleteMany({});
    await Booking.deleteMany({});

    // Create users
    const adminPassword = await hashPassword('admin123');
    const userPassword = await hashPassword('user123');

    const admin = new User({ username: 'admin', email: 'admin@example.com', password: adminPassword, isAdmin: true });
    const user = new User({ username: 'user', email: 'user@example.com', password: userPassword, isAdmin: false });

    await admin.save();
    await user.save();

    // Create courts
    const court1 = new Court({ name: 'Court 1', location: 'Club side' });
    const court2 = new Court({ name: 'Court 2', location: 'Stand side' });

    await court1.save();
    await court2.save();

    // Create bookings
    const booking1 = new Booking({
        user: user._id,
        court: court1._id,
        date: new Date(),
        timeSlot: { start: new Date(), end: new Date() }
    });

    await booking1.save();

    // Close the database connection
    mongoose.connection.close();
};

databaseConnect().then(seedData).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
});
