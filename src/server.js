const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const userRoutes = require('./controllers/UserController');
const courtRoutes = require('./controllers/CourtController');

// make server instance
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Use routes
app.use('/users', userRoutes);
app.use('/courts', courtRoutes);


app.get('/', (req, res) => {
    res.send('Welcome to the Court Connect API');
  });


module.exports = { app }