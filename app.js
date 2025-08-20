require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const tourJobRoutes = require('./routes/tourJobRoutes');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracking', trackingRoutes);
//app.use('/api/jobs', tourJobRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
