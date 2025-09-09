// src/pages/DriverDashboard.jsx
import { useEffect, useState } from "react";
import API from "../api/api";
import socket from "../utils/socket";
import { FaPlay, FaStop } from "react-icons/fa";

const DEMO_MODE = true; // ⚡ set false kalau mau GPS nyata

// Dummy path simulasi perjalanan
const demoPath = [
  { lat: -7.7701, lng: 110.3775 },
  { lat: -7.7710, lng: 110.3790 },
  { lat: -7.7720, lng: 110.3805 },
  { lat: -7.7725, lng: 110.3822 },
  { lat: -7.7735, lng: 110.3840 },
];

export default function DriverDashboard() {
  const [jobs, setJobs] = useState([]);
  const [trackingJobId, setTrackingJobId] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const userId = localStorage.getItem("userId");

  const fetchJobs = async () => {
    try {
      const res = await API.get(
        `/jobs/list?driverId=${userId}&status=on schedule`
      );
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.jobDate) - new Date(a.jobDate)
      );
      setJobs(sorted);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStartTracking = async (jobId) => {
    try {
      await API.post("/tracking/start", { jobId });

      if (DEMO_MODE) {
        let step = 0;
        const id = setInterval(() => {
          const point = demoPath[step % demoPath.length];
          const ts = Date.now();

          // Emit real-time lokasi ke socket
          socket.emit("locationUpdate", {
            userId,
            jobId,
            latitude: point.lat,
            longitude: point.lng,
            timestamp: ts,
          });

          step = (step + 1) % demoPath.length;
        }, 2000);

        setIntervalId(id);
      } else {
        if ("geolocation" in navigator) {
          const watchId = navigator.geolocation.watchPosition(
            (pos) => {
              socket.emit("locationUpdate", {
                userId,
                jobId,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                timestamp: pos.timestamp || Date.now(),
              });
            },
            (err) => console.error("Geolocation error:", err),
            { enableHighAccuracy: true }
          );
          setIntervalId(watchId);
        } else {
          alert("Geolocation not supported.");
        }
      }

      setTrackingJobId(jobId);
      localStorage.setItem(`trackingJobId_${userId}`, jobId);
    } catch (err) {
      console.error("Failed to start tracking:", err);
    }
  };

  const handleStopTracking = async (jobId) => {
    if (DEMO_MODE) clearInterval(intervalId);
    else navigator.geolocation.clearWatch(intervalId);

    try {
      await API.post("/tracking/stop", { jobId });
    } catch (err) {
      console.error("Failed to stop tracking:", err);
    }

    socket.emit("userStopped", { userId });

    localStorage.removeItem(`trackingJobId_${userId}`);
    setTrackingJobId(null);
    setIntervalId(null);
  };

  // Bersihkan interval kalau komponen unmount (hindari zombie interval)
  useEffect(() => {
    return () => {
      if (DEMO_MODE && intervalId) clearInterval(intervalId);
      else if (intervalId) navigator.geolocation.clearWatch(intervalId);
    };
  }, [intervalId]);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <div
          key={job._id}
          className="rounded-2xl p-4 shadow-md text-white"
          style={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
          }}
        >
          <h3 className="text-xl font-semibold mb-1">{job.destination}</h3>
          <p className="text-sm mb-4">
            {new Date(job.jobDate).toLocaleDateString()}
          </p>
          <div className="flex justify-between items-center">
            {trackingJobId !== job._id ? (
              <button
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white"
                onClick={() => handleStartTracking(job._id)}
              >
                <FaPlay />
              </button>
            ) : (
              <button
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
                onClick={() => handleStopTracking(job._id)}
              >
                <FaStop />
              </button>
            )}
            <span className="text-sm">{job.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
