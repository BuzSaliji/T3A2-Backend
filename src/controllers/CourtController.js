const express = require('express');
const { Court } = require('../models/CourtModel'); // Adjust the path as necessary
const authMiddleware = require('../functions/authMiddleware'); // If you have authentication middleware

const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

// Get all courts
router.get('/', async (req, res) => {
    try {
        const courts = await Court.find({});
        res.json(courts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific court by ID
router.get('/:id', async (req, res) => {
    try {
        const court = await Court.findById(req.params.id);
        if (!court) {
            return res.status(404).json({ error: 'Court not found' });
        }
        res.json(court);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new court (Admin only)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const newCourt = new Court(req.body);
        await newCourt.save();
        res.status(201).json(newCourt);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a court (Admin only)
router.patch('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const court = await Court.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!court) {
            return res.status(404).json({ error: 'Court not found' });
        }
        res.json(court);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a court (Admin only)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const court = await Court.findByIdAndDelete(req.params.id);
        if (!court) {
            return res.status(404).json({ error: 'Court not found' });
        }
        res.json({ message: 'Court deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
