// src/pages/GuideDashboard.jsx
import { useEffect, useState } from "react";
import API from "../api/api";
import socket from "../utils/socket";
import { FaPlay, FaStop } from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const DEMO_MODE = true; // ⚡ Set false kalau mau GPS asli

// Dummy path simulasi perjalanan GUIDE → Rute B
const demoPathGuide = [
  { lat: -7.7605, lng: 110.3765 },
  { lat: -7.7615, lng: 110.3780 },
  { lat: -7.7625, lng: 110.3798 },
  { lat: -7.7635, lng: 110.3815 },
  { lat: -7.7645, lng: 110.3832 },
];

export default function GuideDashboard() {
  const [jobs, setJobs] = useState([]);
  const [trackingJobId, setTrackingJobId] = useState(null); // format: `${jobId}_${destinationId}`
  const [intervalId, setIntervalId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);

  const userId = localStorage.getItem("userId");

  // Ambil semua job untuk guide
  const fetchJobs = async () => {
    try {
      const res = await API.get(
        `/jobs/list?guideId=${userId}&status=on schedule`
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

  // Mulai tracking lokasi
  const handleStartTracking = async (jobId, destinationId) => {
    try {
      await API.post("/tracking/start", { jobId, destinationId });

      if (DEMO_MODE) {
        let step = 0;
        const id = setInterval(() => {
          const point = demoPathGuide[step % demoPathGuide.length];
          const ts = Date.now();

          // Emit lokasi real-time ke socket.io
          socket.emit("locationUpdate", {
            userId,
            jobId,
            destinationId,
            latitude: point.lat,
            longitude: point.lng,
            timestamp: ts,
          });

          step = (step + 1) % demoPathGuide.length;
        }, 2000);

        setIntervalId(id);
      } else {
        if ("geolocation" in navigator) {
          const watchId = navigator.geolocation.watchPosition(
            (pos) => {
              socket.emit("locationUpdate", {
                userId,
                jobId,
                destinationId,
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

      setTrackingJobId(`${jobId}_${destinationId}`);
      localStorage.setItem(
        `trackingJobId_${userId}`,
        `${jobId}_${destinationId}`
      );
    } catch (err) {
      console.error("Failed to start tracking:", err);
    }
  };

  // Berhenti tracking lokasi
  const handleStopTracking = async (jobId, destinationId) => {
    if (DEMO_MODE) clearInterval(intervalId);
    else navigator.geolocation.clearWatch(intervalId);

    try {
      await API.post("/tracking/stop", { jobId, destinationId });
    } catch (err) {
      console.error("Failed to stop tracking:", err);
    }

    socket.emit("userStopped", { userId, jobId, destinationId });

    localStorage.removeItem(`trackingJobId_${userId}`);
    setTrackingJobId(null);
    setIntervalId(null);
  };

  // Bersihkan interval/watch kalau component unmount
  useEffect(() => {
    return () => {
      if (DEMO_MODE && intervalId) clearInterval(intervalId);
      else if (intervalId) navigator.geolocation.clearWatch(intervalId);
    };
  }, [intervalId]);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {jobs.map((job) => {
        const isExpanded = expandedJobId === job._id;
        return (
          <div
            key={job._id}
            className="rounded-2xl p-4 shadow-md text-white cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #38b2ac, #3182ce)",
            }}
            onClick={() => setExpandedJobId(isExpanded ? null : job._id)}
          >
            {/* Card Utama */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  {job.tourPackageId?.package_name || "Unnamed Package"}
                </h3>
                <p className="text-sm mb-1">
                  {new Date(job.jobDate).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  👤 {job.customerName} ({job.customerPhone})
                </p>
              </div>
              <div className="ml-2">
                {isExpanded ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
            </div>

            {/* Expand Destinations */}
            {isExpanded && (
              <div className="space-y-3 mt-3">
                {job.tourPackageId?.destinations?.map((dest) => (
                  <div
                    key={dest._id}
                    className="p-3 bg-white text-black rounded-xl shadow"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Destinasi Info */}
                    <h4 className="font-semibold text-lg">{dest.name}</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      📍 {dest.place}
                    </p>

                    {/* Activities / Itineraries */}
                    {dest.itineraries && dest.itineraries.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                        {dest.itineraries.map((it, idx) => (
                          <li key={idx} className="leading-snug">
                            {it.activity}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Tracking Button */}
                    <div className="flex justify-between items-center mt-3">
                      {trackingJobId !== `${job._id}_${dest._id}` ? (
                        <button
                          className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center"
                          onClick={() =>
                            handleStartTracking(job._id, dest._id)
                          }
                        >
                          <FaPlay />
                        </button>
                      ) : (
                        <button
                          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
                          onClick={() =>
                            handleStopTracking(job._id, dest._id)
                          }
                        >
                          <FaStop />
                        </button>
                      )}
                      <span className="text-sm">{job.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
