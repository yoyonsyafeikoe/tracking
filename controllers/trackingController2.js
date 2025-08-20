const TrackingSession = require('../models/TrackingSession');

// Start tracking
const startTracking = async (req, res) => {
  try {
    const { lat,lng,jobId } = req.body;

    // Check for active session
    const existingSession = await TrackingSession.findOne({
      userId: req.user._id,
      endedAt: { $exists: false }
    });

    if (existingSession) {
      return res.status(400).json({
        message: 'You already have an active tracking session. Please stop it before starting a new one.'
      });
    }

    const session = new TrackingSession({
      userId: req.user._id,
      jobId,
      lat,
      lng
    });

    await session.save();

    res.status(201).json({ message: 'Tracking started', session });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start tracking', error: error.message });
  }
};

// Stop tracking
const stopTracking = async (jobId) => {
  const watchId = watchIds[jobId];
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      socket.emit('locationUpdate', {
        userId,
        jobId,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      try {
        // ✅ Tell backend to mark job completed
        await API.patch(`/jobs/${jobId}/status`, { status: 'completed' });
    
        // ✅ Tell backend to remove from active tracking
        await API.delete(`/tracking/active/${userId}`);
    
        // ✅ Refresh job list
        const res = await API.get(`/jobs/list?driverId=${userId}&status=on schedule`);
        const sorted = [...res.data].sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate));
        setJobs(sorted);
      } catch (err) {
        console.error('Failed to complete stopTracking:', err);
      }

      // ✅ Mark job as completed
      try {
        await API.patch(`/jobs/${jobId}/status`, { status: 'completed' });
      } catch (err) {
        console.error('Failed to mark job as completed:', err);
      }

      // Refresh job list
      const res = await API.get(`/jobs/list?driverId=${userId}&status=on schedule`);
      const sorted = [...res.data].sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate));
      setJobs(sorted);
    });

    // Clean up state
    setWatchIds((prev) => {
      const copy = { ...prev };
      delete copy[jobId];
      return copy;
    });

    setActiveTracking((prev) => {
      const copy = { ...prev };
      delete copy[jobId];
      return copy;
    });

    localStorage.removeItem('trackingJobId');
  }
};

const getTrackingHistory = async (req, res) => {
  const { userId, jobId,fromDate, toDate, status } = req.query;

  const filter = {};
  if (userId) filter.userId = userId;
  if (jobId) filter.jobId = jobId;

  // Optional date range filter
  if (fromDate || toDate) {
    filter.startedAt = {};
    if (fromDate) filter.startedAt.$gte = new Date(fromDate);
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // extend to end of the day
      filter.startedAt.$lte = to;
    }
  }

  try {
    let query = TrackingSession.find(filter)
      .populate({
        path: 'jobId',
        select: 'destination jobDate status',
      })
      .sort({ startedAt: -1 });

    let history = await query;

    // Optional job status filter (after populate)
    if (status) {
      history = history.filter(session => session.jobId?.status === status);
    }

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tracking history', error: err.message });
  }
};

const ActiveTracking = require('../models/ActiveTracking');

exports.getActiveTrackings = async (req, res) => {
  try {
    const active = await ActiveTracking.find().populate('userId jobId');
    res.json(active);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch active tracking' });
  }
};


// Export all
module.exports = {
  startTracking,
  stopTracking,
  getTrackingHistory
};
