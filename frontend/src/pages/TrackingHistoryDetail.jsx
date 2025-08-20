// src/pages/TrackingHistoryDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function TrackingHistoryDetail() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API.get(`/tracking/${sessionId}`);
        setSession(res.data);
      } catch (err) {
        console.error("Failed to fetch session detail:", err);
        setError("Gagal memuat detail tracking.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [sessionId]);

  if (loading) {
    return <p className="p-4 text-gray-600">Memuat detail tracking...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  if (!session || !session.points || session.points.length === 0) {
    return <p className="p-4 text-gray-500">Tidak ada data tracking untuk sesi ini.</p>;
  }

  const positions = session.points.map((p) => [p.latitude, p.longitude]);

  return (
    <div className="p-6">
      {/* Tombol Kembali */}
      <Link
        to="/tracking-history"
        className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
      >
        ← Back
      </Link>

      {/* Judul & Info Job */}
      <h2 className="text-xl font-bold mt-4 mb-2">
        Tracking Detail - {session.jobId?.destination || "Unknown"}
      </h2>

      <div className="bg-gray-50 p-4 rounded-lg shadow mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Driver:</span> {session.jobId?.driverId?.username || "-"}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Guide:</span> {session.jobId?.guideId?.username || "-"}
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

      {/* MAP */}
      <div className="h-96 w-full mb-6 shadow rounded-lg overflow-hidden">
        <MapContainer
          center={positions[0]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Polyline positions={positions} color="blue" />
          {/* Marker Start */}
          <Marker position={positions[0]}>
            <Popup>Start Point</Popup>
          </Marker>
          {/* Marker End */}
          <Marker position={positions[positions.length - 1]}>
            <Popup>End Point</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Daftar Nama Jalan */}
      {session.streets && session.streets.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow mt-4">
          <h3 className="font-semibold mb-2 text-gray-800">Route taken:</h3>
          <ul className="list-disc ml-6 text-sm space-y-1">
            {session.streets.map((s, i) => (
              <li key={i} className="text-gray-700">
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No tracking route.</p>
      )}

    </div>
  );
}
