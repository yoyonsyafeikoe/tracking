// sockets/analyticsSocket.js
const { fetchAnalyticsData } = require('../services/analyticsService');

function setupAnalyticsSocket(io) {
  const sendAnalytics = async () => {
    try {
      const data = await fetchAnalyticsData();
      io.emit('analytics:update', data);
    } catch (err) {
      console.error('Analytics socket error:', err.message);
    }
  };

  // Initial send + repeat every 7s
  sendAnalytics();
  const interval = setInterval(sendAnalytics, 15000);

  io.on('disconnect', () => clearInterval(interval));
}

module.exports = setupAnalyticsSocket;
