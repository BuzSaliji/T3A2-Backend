require('dotenv').config();

const mongoose = require('mongoose');
const { User } = require('./models/UserModel');
const { databaseConnect } = require('./database');
const { hashPassword } = require('./functions/userAuthFunctions');

databaseConnect().then(async () => {
    console.log("Creating seed data!");

    // Create an admin user
    const adminData = {
        username: "AdminUser",
        email: "admin@email.com",
        password: "AdminPassword1",
        isAdmin: true // Assuming your User model has an 'isAdmin' field
    };

    // Hash the password
    adminData.password = await hashPassword(adminData.password);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (!existingAdmin) {
        // Create new admin user
        const newAdmin = new User(adminData);
        await newAdmin.save();
        console.log("Admin user created successfully.");
    } else {
        console.log("Admin user already exists.");
    }

}).catch(error => {
    console.error("Error seeding data:", error);
});