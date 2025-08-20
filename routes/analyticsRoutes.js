// routes/analyticsRoute.js
const express = require('express');
const router = express.Router();
const { fetchAnalyticsData } = require('../services/analyticsService');

router.get('/data', async (req, res) => {
  try {
    const data = await fetchAnalyticsData();
    res.json(data);
  } catch (err) {
    console.error('Analytics route error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
