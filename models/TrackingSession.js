const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const streetSchema = new mongoose.Schema({
  name: String,                // e.g. "Jl. Raya Sesetan"
  distanceMeters: Number,      // jarak pada segmen jalan tsb (opsional, jika tersedia)
}, { _id: false });

const trackingSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  jobId:  { type: mongoose.Schema.Types.ObjectId, ref: 'TourJob', index: true, required: true },
  role:   { type: String, enum: ['driver','guide'], required: true }, // penting: pisah sesi
  startedAt: { type: Date, default: Date.now, index: true },
  endedAt:   { type: Date },

  // jalur mentah
  points: [pointSchema],       // kumpulan titik saat update location

  // ringkasan
  totalDistanceKm: { type: Number, default: 0 }, // akumulasi via Haversine
  streets: [streetSchema],     // hasil OSRM/Nominatim saat Stop
  status: { type: String, enum: ['active','completed','cancelled'], default: 'active' }
}, { timestamps: true });

trackingSessionSchema.index({ userId: 1, jobId: 1, status: 1 });

module.exports = mongoose.model('TrackingSession', trackingSessionSchema);
