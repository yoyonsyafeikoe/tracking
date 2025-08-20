// models/TrackingSession.js
const mongoose = require('mongoose');

const trackingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourJob',
    required: true,
  },
  lat: Number,
  lng: Number,
  endLat: Number,
  endLng: Number,
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: Date,
  locations: [
    {
      lat: Number,
      lng: Number,
      timestamp: {
        type: Date,
        default: Date.now,
      }
    }
  ]
});

module.exports = mongoose.model('TrackingSession', trackingSessionSchema);
