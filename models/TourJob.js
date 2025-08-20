const mongoose = require('mongoose');

const tourJobSchema = new mongoose.Schema({
  jobDate: {
    type: Date,
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['on schedule', 'cancel', 'completed'],
    default: 'on schedule'
  }
});

module.exports = mongoose.model('TourJob', tourJobSchema);
