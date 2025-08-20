const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/trackingController');
const { getHistoryByJob } = require('../controllers/trackingController');
const TrackingSession = require('../models/TrackingSession');


router.post('/start', authenticate, ctrl.startTracking);
router.post('/update', authenticate, ctrl.updateTracking);
router.post('/stop', authenticate, ctrl.stopTracking);
router.get('/history', authenticate, ctrl.getHistory);
router.get('/history/:jobId', authenticate, ctrl.getHistoryByJob);
// Dapatkan semua sesi aktif (buat MonitoringPage)
router.get('/active', authenticate, ctrl.getActiveSessions);
router.delete('/active/:userId', authenticate, ctrl.removeActiveTracking);
router.get('/:sessionId', authenticate, async (req, res) => {
  try {
    const session = await TrackingSession.findById(req.params.sessionId)
      .populate({
        path: 'jobId',
        select: 'destination jobDate status driverId guideId',
        populate: [
          { path: 'driverId', select: 'username' },
          { path: 'guideId', select: 'username' }
        ]
      })
      .populate('userId', 'username role');

    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error("Get session error:", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
