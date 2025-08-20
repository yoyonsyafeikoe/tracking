// models/ActiveTracking.js
const mongoose = require('mongoose');

const activeTrackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'TourJob', required: true },
  latitude: Number,
  longitude: Number,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActiveTracking', activeTrackingSchema);
