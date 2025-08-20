const TrackingSession = require('../models/TrackingSession');
const TourJob = require('../models/TourJob');
const axios = require('axios');
const ActiveTracking = require('../models/ActiveTracking');

// Haversine (km)
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// --- START ---
exports.startTracking = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user._id;
    const role = req.user.role; // 'driver' atau 'guide'

    // Pastikan job ada
    const job = await TourJob.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Cek kalau masih ada sesi aktif user ini untuk job yg sama → tutup/abort lama
    await TrackingSession.updateMany(
      { userId, jobId, status: 'active' },
      { $set: { status: 'cancelled', endedAt: new Date() } }
    );

    const session = await TrackingSession.create({
      userId, jobId, role,
      points: [],
      totalDistanceKm: 0,
      status: 'active'
    });

    res.json({ message: 'Session started', sessionId: session._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start', error: err.message });
  }
};

// --- UPDATE (dipanggil berkala dari mobile via watchPosition) ---
// PATCH /tracking/update

exports.updateTracking = async (req, res) => {
  try {
    const { jobId, latitude, longitude, timestamp } = req.body;
    const userId = req.user._id;

    const session = await TrackingSession.findOne({ userId, jobId, status: 'active' });
    if (!session) return res.status(404).json({ message: 'Active session not found' });

    // Ambil titik terakhir
    const last = session.points[session.points.length - 1];

    // ✅ Abaikan kalau koordinat sama persis
    if (last && last.latitude === latitude && last.longitude === longitude) {
      return res.json({ ok: true, skipped: true });
    }

    // Hitung jarak hanya jika titik berbeda
    if (last) {
      const inc = haversineKm(last.latitude, last.longitude, latitude, longitude);
      session.totalDistanceKm += inc;
    }

    // Tambahkan titik baru
    session.points.push({
      latitude,
      longitude,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    await session.save();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update', error: err.message });
  }
};


// Fungsi helper hitung jarak antar titik (Haversine Formula)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- STOP (selesaikan + ambil nama jalan via OSRM/OSM) ---
exports.stopTracking = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user._id;

    const session = await TrackingSession.findOne({ userId, jobId, status: 'active' });
    if (!session) return res.status(404).json({ message: 'Active session not found' });

    session.status = 'completed';
    session.endedAt = new Date();

    // Ambil streets dari OSRM (gratis, publik; bila perlu pindah ke self-host)
    // format: lon,lat;lon,lat;...
    const coords = session.points.map(p => `${p.longitude},${p.latitude}`).join(';');
    let streets = [];
    if (session.points.length >= 2) {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&steps=true&geometries=geojson`;
        const { data } = await axios.get(url, { timeout: 10000 });
        const steps = (data.routes?.[0]?.legs || []).flatMap(leg => leg.steps || []);

        // Ringkas: kumpulkan nama jalan unik berurutan
        const names = [];
        const seen = new Set();

        for (const s of steps) {
          const n = s.name && s.name.trim();
          // Hanya masukkan nama jalan yang belum pernah disimpan sebelumnya
          if (n && !seen.has(n)) {
            names.push(n);
            seen.add(n);
          }
        }
        // Simpan sebagai {name}
        streets = names.map(n => ({ name: n }));
      } catch (e) {
        // Tidak fatal – tetap simpan sesi tanpa streets
        console.warn('OSRM failed:', e.message);
      }
    }

    session.streets = streets;
    await session.save();

    // (Opsional) auto-complete job jika policy-nya begitu:
    // await TourJob.findByIdAndUpdate(jobId, { status: 'completed' });

    res.json({ message: 'Session completed', totalDistanceKm: session.totalDistanceKm, streets });
  } catch (err) {
    res.status(500).json({ message: 'Failed to stop', error: err.message });
  }
};

// --- HISTORY ---
exports.getHistory = async (req, res) => {
  try {
    const { userId, role, fromDate, toDate, jobStatus } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (role) filter.role = role;
    if (fromDate || toDate) {
      filter.startedAt = {};
      if (fromDate) filter.startedAt.$gte = new Date(fromDate);
      if (toDate)   filter.startedAt.$lte = new Date(toDate + 'T23:59:59.999Z');
    }
    const sessions = await TrackingSession.find(filter)
      .populate({
        path: 'jobId',
        select: 'destination jobDate status driverId guideId',
        populate: [
          { path: 'driverId', select: 'username' },
          { path: 'guideId', select: 'username' }
        ]
      })
      .populate('userId', 'username role')
      .sort({ startedAt: -1 });

    // filter by job status jika diminta
    const result = jobStatus
      ? sessions.filter(s => s.jobId?.status === jobStatus)
      : sessions;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get history', error: err.message });
  }
};

// controllers/trackingController.js
exports.getHistoryByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const sessions = await TrackingSession.find({ jobId, status: 'completed' })
      .populate('userId', 'username role')
      .sort({ startedAt: 1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get job history', error: err.message });
  }
};

exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await TrackingSession.find({ status: 'active' })
      .populate('userId', 'username role')
      .populate('jobId', 'destination jobDate status');

    const formatted = sessions.map(s => ({
      userId: s.userId._id,
      username: s.userId.username,
      role: s.userId.role,
      latitude: s.points.length ? s.points[s.points.length - 1].latitude : null,
      longitude: s.points.length ? s.points[s.points.length - 1].longitude : null,
      job: s.jobId ? {
        destination: s.jobId.destination,
        date: s.jobId.jobDate,
        status: s.jobId.status,
      } : null
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get active sessions', error: err.message });
  }
};

exports.removeActiveTracking = async (req, res) => {
  try {
    const { userId } = req.params;
    await ActiveTracking.deleteOne({ userId });
    return res.json({ message: "Active tracking removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove active tracking", error: err.message });
  }
};

exports.getTrackingHistory = async (req, res) => {
  try {
    const sessions = await TrackingSession.find()
      .populate({
        path: "jobId",
        populate: [
          { path: "driverId", select: "username" },
          { path: "guideId", select: "username" }
        ]
      });

    res.status(200).json({ success: true, sessions });
  } catch (err) {
    console.error("Error getTrackingHistory:", err);
    res.status(500).json({ success: false, message: "Gagal ambil tracking history" });
  }
};

exports.getTrackingByJob = async (req, res) => {
  try {
    const session = await TrackingSession.findOne({ jobId: req.params.id });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session tidak ditemukan" });
    }

    res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("Error getTrackingByJob:", err);
    res.status(500).json({ success: false, message: "Gagal ambil data tracking" });
  }
};




