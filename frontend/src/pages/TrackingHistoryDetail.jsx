// src/pages/TrackingHistoryDetail.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import API from "../api/api";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEMO_MODE = true; // 🔹 Set false kalau mau pakai GPS asli

function FlyToMarker({ position, follow }) {
  const map = useMap();
  useEffect(() => {
    if (follow && position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, follow, map]);
  return null;
}

export default function TrackingHistoryDetail() {
  const { sessionId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const destinationId = queryParams.get("destinationId");

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [followMarker, setFollowMarker] = useState(true);
  const [showAllStreets, setShowAllStreets] = useState(false);

  const markerRef = useRef(null);
  const intervalRef = useRef(null);
  const speedData = useRef([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API.get(`/tracking/${sessionId}`);
        
        let sess = res.data;
        console.log("📌 Streets di FE - atas:", sess);
        // Jika ada filter destinationId → hanya ambil points & streets sesuai
        if (destinationId && sess && sess.points?.length > 0) {
          sess = {
            ...sess,
            points: sess.points.filter(
              (p) => p.destinationId === destinationId
            ),
          };
        }
        console.log("📌 Streets di FE - bawah:", sess);
        setSession(sess);
      } catch (err) {
        console.error("Failed to fetch session detail:", err);
        setError("Gagal memuat detail tracking.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [sessionId, destinationId]);

  const calculateSpeed = (prev, next) => {
    if (!prev || !next) return 0;

    if (DEMO_MODE) {
      return Math.floor(Math.random() * 40) + 40; // Fake 40–80 km/jam
    }

    // Produksi → hitung berdasarkan jarak dan waktu
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(next.latitude - prev.latitude);
    const dLon = toRad(next.longitude - prev.longitude);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(prev.latitude)) *
        Math.cos(toRad(next.latitude)) *
        Math.sin(dLon / 2) ** 2;

    const dKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const deltaTime =
      (new Date(next.timestamp) - new Date(prev.timestamp)) / 3600000;

    return deltaTime > 0 ? Math.round(dKm / deltaTime) : 0;
  };

  const handleReplay = () => {
    if (!session || !session.points || session.points.length === 0) return;

    setIsReplaying(true);
    setReplayIndex(0);
    setCurrentSpeed(0);
    setAverageSpeed(0);
    setMaxSpeed(0);
    speedData.current = [];

    let i = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      i++;
      if (i >= session.points.length) {
        clearInterval(intervalRef.current);
        setIsReplaying(false);
        return;
      }

      setReplayIndex(i);

      const prev = session.points[i - 1];
      const next = session.points[i];
      const speedNow = calculateSpeed(prev, next);
      setCurrentSpeed(speedNow);

      speedData.current.push(speedNow);
      const total = speedData.current.reduce((a, b) => a + b, 0);
      setAverageSpeed((total / speedData.current.length).toFixed(1));
      setMaxSpeed(Math.max(...speedData.current));
    }, speed);
  };

  if (loading) return <p className="p-4 text-gray-600">Loading tracking detail ...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!session || !session.points || session.points.length === 0)
    return <p className="p-4 text-gray-500">No tracking data for this session.</p>;

  const positions = session.points.map((p) => [p.latitude, p.longitude]);
  const currentPosition = positions[replayIndex] || positions[0];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Tracking Detail - {session.jobId?.destination || "Unknown"}
      </h2>

      {/* TOP INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Driver:</span>{" "}
            {session.jobId?.driverId?.username || "-"}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Guide:</span>{" "}
            {session.jobId?.guideId?.username || "-"}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Date:</span>{" "}
            {session.jobId?.jobDate
              ? new Date(session.jobId.jobDate).toLocaleDateString()
              : "-"}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                session.jobId?.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : session.jobId?.status === "cancel"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {session.jobId?.status || "-"}
            </span>
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-semibold">Total Distance:</span>{" "}
            <span className="font-bold text-blue-600">
              {session.totalDistanceKm?.toFixed(2)} km
            </span>
          </p>
        </div>

        {/* Route Taken */}
        <div className="bg-white p-4 rounded-lg shadow max-h-48 overflow-hidden">
          <h3 className="font-semibold mb-2 text-gray-800">Route Taken:</h3>
          <div className="grid grid-cols-2 gap-x-8">
            {(showAllStreets ? session.streets : session.streets?.slice(0, 10))?.map((s, i) => (
              <p key={i} className="text-sm text-gray-700">
                • {s?.name || "(no street name)"}
              </p>
            ))}
          </div>
          {session.streets?.length > 10 && (
            <button
              onClick={() => setShowAllStreets(!showAllStreets)}
              className="mt-2 text-blue-600 hover:underline text-sm"
            >
              {showAllStreets ? "Show less" : "See all"}
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4 bg-white shadow p-3 rounded-lg">
        <button
          onClick={handleReplay}
          disabled={isReplaying}
          className={`px-4 py-2 rounded-lg font-semibold shadow ${
            isReplaying ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          {isReplaying ? "Replaying..." : "▶ Play"}
        </button>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">Speed:</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={1000}>Slow (1s)</option>
            <option value={500}>Middle (0.5s)</option>
            <option value={200}>Fast (0.2s)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={followMarker}
            onChange={(e) => setFollowMarker(e.target.checked)}
          />
          <label className="text-sm">Follow marker</label>
        </div>

        <div className="ml-auto flex gap-6 text-sm font-semibold text-gray-700">
          <span>
            Live Speed:{" "}
            <span className="text-blue-600">{currentSpeed} km/h</span>
          </span>
          <span>
            Avg Speed:{" "}
            <span className="text-green-600">{averageSpeed} km/h</span>
          </span>
          <span>
            Max Speed:{" "}
            <span className="text-red-600">{maxSpeed} km/h</span>
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="h-96 w-full mt-4 shadow rounded-lg overflow-hidden">
        <MapContainer
          center={positions[0]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={positions} color="blue" />
          <Marker position={currentPosition} ref={markerRef}>
            <Popup>
              {isReplaying
                ? `Step ${replayIndex + 1}/${positions.length}`
                : "Replay Marker"}
            </Popup>
          </Marker>
          <FlyToMarker position={currentPosition} follow={followMarker} />
        </MapContainer>
      </div>
    </div>
  );
}
