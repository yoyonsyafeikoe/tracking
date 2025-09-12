import { useEffect, useState } from "react";
import API from "../api/api"; // axios instance
import { FaPlay, FaStop, FaChevronDown, FaChevronUp } from "react-icons/fa";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // sesuaikan URL backend kamu

export default function DriverDashboard() {
  const [jobs, setJobs] = useState([]);
  const [trackingDestinationId, setTrackingDestinationId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get(`/jobs/list?driverId=${userId}&status=on schedule`);
        setJobs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      }
    };
    fetchJobs();
  }, [userId]);

  const handleStartTracking = async (jobId, destinationId) => {
    try {
      await API.post("/tracking/start", { jobId, destinationId });
      setTrackingDestinationId(destinationId);
      localStorage.setItem(`trackingDestinationId_${userId}`, destinationId);

      // 🔹 Emit lokasi pertama langsung, biar marker muncul instan
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const timestamp = Date.now();

          socket.emit("locationUpdate", {
            userId,
            jobId,
            destinationId,
            latitude,
            longitude,
            timestamp,
          });

          await API.post("/tracking/update", {
            jobId,
            destinationId,
            latitude,
            longitude,
            timestamp,
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );

      // 🔹 Interval update 10 detik
      window.trackingInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const timestamp = Date.now();

            socket.emit("locationUpdate", {
              userId,
              jobId,
              destinationId,
              latitude,
              longitude,
              timestamp,
            });

            await API.post("/tracking/update", {
              jobId,
              destinationId,
              latitude,
              longitude,
              timestamp,
            });
          },
          (err) => console.error("Geolocation error:", err),
          { enableHighAccuracy: true }
        );
      }, 10000);
    } catch (err) {
      console.error("Failed to start tracking:", err);
    }
  };

  const handleStopTracking = async (jobId, destinationId) => {
    try {
      if (window.trackingInterval) clearInterval(window.trackingInterval);

      // Emit stop ke socket
      socket.emit("userStopped", { userId });

      // API stopTracking
      await API.post("/tracking/stop", { jobId, destinationId });

      setTrackingDestinationId(null);
      localStorage.removeItem(`trackingDestinationId_${userId}`);
    } catch (err) {
      console.error("Failed to stop tracking:", err);
    }
  };

  const toggleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  return (
    <div className="p-4">
      {jobs.length === 0 && <p className="text-white">No jobs assigned.</p>}

      {jobs.map((job) => {
        const pkg = job.tourPackageId;
        const isExpanded = expandedJobId === job._id;

        return (
          <div
            key={job._id}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 mb-6 shadow-lg text-white"
          >
            {/* Header */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(job._id)}
            >
              <div>
                <h3 className="text-xl font-bold">
                  {pkg?.package_name || "Unnamed Package"}
                </h3>
                <p className="text-sm opacity-80">
                  Job Date: {new Date(job.jobDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm italic">{job.status}</span>
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {/* Destinations */}
            {isExpanded && (
              <div className="mt-4 space-y-4">
                {pkg?.destinations?.map((dest) => (
                  <div
                    key={dest._id}
                    className="bg-white text-black rounded-xl p-4 shadow-md"
                  >
                    <h4 className="font-semibold text-lg mb-2">{dest.place}</h4>
                    <ul className="pl-4 text-sm space-y-1 mb-3">
                      {dest.itineraries.map((it, ii) => (
                        <li key={ii}>
                          <span className="font-medium">Day {it.day}:</span>{" "}
                          {it.activity}
                        </li>
                      ))}
                    </ul>

                    {trackingDestinationId !== dest._id ? (
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                        onClick={() => handleStartTracking(job._id, dest._id)}
                      >
                        <FaPlay /> Start {dest.place}
                      </button>
                    ) : (
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                        onClick={() => handleStopTracking(job._id, dest._id)}
                      >
                        <FaStop /> Stop
                      </button>
                    )}
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
