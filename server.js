const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const User = require('./models/User');
const ActiveTracking = require('./models/ActiveTracking');
const TourJob = require('./models/TourJob');
const TrackingSession = require('./models/TrackingSession'); // ✅ penting

const app = require('./app');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// === Controller & Routes ===
const tourJobController = require('./controllers/tourJobController')(io);
const tourJobRoutes = require('./routes/tourJobRoutes')(tourJobController);
const analyticsRoutes = require('./routes/analyticsRoutes');
require('./sockets/analyticsSocket')(io);

app.use('/api/jobs', tourJobRoutes);
app.use('/api/tracking', require('./routes/trackingRoutes'));
app.use('/api/analytics', analyticsRoutes);

// === Socket.IO: location updates ===
io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id);

  // 🔥 lokasi real-time
    socket.on('locationUpdate', async ({ userId, jobId, latitude, longitude }) => {
  try {
    const job = await TourJob.findById(jobId);
    if (!job) return;

    // Active marker
    await ActiveTracking.findOneAndUpdate(
      { userId },
      { userId, jobId, latitude, longitude, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Simpan ke TrackingSession
    const session = await TrackingSession.findOne({ userId, jobId, status: 'active' });
    if (session) {
      const last = session.points[session.points.length - 1];
      let inc = 0;
      if (last) {
        const toRad = (d) => (d * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(latitude - last.latitude);
        const dLon = toRad(longitude - last.longitude);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(last.latitude)) *
            Math.cos(toRad(latitude)) *
            Math.sin(dLon / 2) ** 2;
        inc = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
      }
      session.totalDistanceKm += inc;
      session.points.push({ latitude, longitude, timestamp: new Date() });
      await session.save();
    }

    const user = await User.findById(userId).select("username role");
    io.emit("userLocation", {
      userId,
      username: user?.username,
      role: user?.role,
      latitude,
      longitude,
      job: { destination: job.destination, date: job.jobDate },
    });
  } catch (err) {
    console.error("❌ locationUpdate error:", err);
  }
});

  // 🔥 stop tracking
  socket.on('userStopped', async ({ userId }) => {
    console.log('🛑 User stopped:', userId);
    try {
      await ActiveTracking.deleteOne({ userId });

      // juga update TrackingSession ke completed
      await TrackingSession.updateMany(
        { userId, status: 'active' },
        { $set: { status: 'completed', endedAt: new Date() } }
      );

      io.emit('removeUser', { userId: String(userId) });
    } catch (err) {
      console.error('❌ Failed to remove user from active tracking:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❎ Socket disconnected:', socket.id);
  });
});

// === Start server ===
mongoose.connect('mongodb://localhost:27017/tracker_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
  server.listen(5000, () => console.log('🚀 Server running on port 5000'));
}).catch(err => console.error('❌ MongoDB connection failed:', err.message));
