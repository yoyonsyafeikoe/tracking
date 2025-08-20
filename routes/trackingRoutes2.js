const express = require('express');
const router = express.Router();
const { startTracking, updateTracking, stopTracking, getTrackingHistory } = require('../controllers/trackingController');
const { authenticate } = require('../middlewares/authMiddleware');
const tracking = require('../controllers/trackingController');
const ActiveTracking = require('../models/ActiveTracking');
const User = require('../models/User');
const Job = require('../models/TourJob');

router.post('/start', authenticate, startTracking);
router.post('/stop', authenticate, stopTracking);
router.get('/history', authenticate, getTrackingHistory);
router.get('/active', async (req, res) => {
    try {
        const activeTrackers = await ActiveTracking.find();
    
        const enriched = await Promise.all(
          activeTrackers.map(async (track) => {
            const user = await User.findById(track.userId).select('username role');
            const job = track.jobId ? await Job.findById(track.jobId) : null;
            return {
              userId: track.userId,
              latitude: track.latitude,
              longitude: track.longitude,
              username: user?.username || 'Unknown',
              role: user?.role || 'unknown',
              job: job ? {
                destination: job.destination,
                date: job.jobDate
              } : null
            };
          })
        );
    
        res.json(enriched);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch active trackers' });
      }
  });

  router.delete('/active/:userId', async (req, res) => {
    try {
      await ActiveTracking.deleteOne({ userId: req.params.userId });
      res.json({ message: 'User removed from active tracking' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to remove tracker' });
    }
  });
  

module.exports = router;
