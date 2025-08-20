import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import API from "../api/api";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function JobHistoryDetail() {
  const { jobId } = useParams();
  const [tracking, setTracking] = useState([]);
  const [summary, setSummary] = useState({ distanceKm: 0 });

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await API.get(`/tracking/history/${jobId}`);
        setTracking(res.data.points || []);
        setSummary({
          distanceKm: res.data.totalDistanceKm,
        });
      } catch (err) {
        console.error("Failed to fetch tracking", err);
      }
    };
    fetchTracking();
  }, [jobId]);

  if (tracking.length === 0) {
    return <p className="p-4">No tracking data available.</p>;
  }

  const positions = tracking.map((t) => [t.latitude, t.longitude]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Job Detail</h2>
      <p className="mb-4">Total Distance: {summary.distanceKm.toFixed(2)} km</p>

      <MapContainer
        center={positions[0]}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Polyline positions={positions} color="blue" />

        {/* Start Marker */}
        <Marker position={positions[0]} icon={blueIcon}>
          <Popup>Start Point</Popup>
        </Marker>

        {/* End Marker */}
        <Marker position={positions[positions.length - 1]} icon={blueIcon}>
          <Popup>End Point</Popup>
        </Marker>
      </MapContainer>

      <div className="mt-4">
        <h3 className="font-semibold">Tracking Points:</h3>
        <ul className="list-disc ml-6">
          {tracking.map((t, i) => (
            <li key={i}>
              {new Date(t.timestamp).toLocaleTimeString()} — {t.latitude},{" "}
              {t.longitude}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
