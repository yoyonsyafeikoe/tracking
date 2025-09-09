// src/pages/MonitoringPage.jsx
import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import socket from "../utils/socket";
import "leaflet/dist/leaflet.css";
import "leaflet.marker.slideto";
import API from "../api/api";

// DEMO MODE SWITCH
const DEMO_MODE = true; // 🔹 ubah ke false untuk real GPS

// ICONS
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Haversine (Km)
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 13);
  }, [lat, lng]);
  return null;
}

export default function MonitoringPage() {
  const [users, setUsers] = useState([]);
  const [focus, setFocus] = useState(null);
  const [paths, setPaths] = useState({});
  const [filter, setFilter] = useState("all");
  const [speeds, setSpeeds] = useState({});
  const [maxSpeeds, setMaxSpeeds] = useState({});

  const markersRef = useRef({});
  const lastPointsRef = useRef({}); // { userId: { lat, lng, ts } }

  // Parameter filter noise
  const MIN_DIST_KM = 0.005; // minimal 5 meter
  const MAX_SPEED_KMH = 180; // buang spike >180 km/h (hanya real GPS)
  const MIN_TIME_HOURS = 1 / 3600; // minimal 1 detik

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await API.get("/tracking/active");
        setUsers(res.data);

        const initialPaths = {};
        const initialLast = {};
        res.data.forEach((u) => {
          if (u.latitude != null && u.longitude != null) {
            initialPaths[u.userId] = [[u.latitude, u.longitude]];
            initialLast[u.userId] = {
              lat: u.latitude,
              lng: u.longitude,
              ts: u.timestamp ? new Date(u.timestamp).getTime() : Date.now(),
            };
          }
        });
        setPaths(initialPaths);
        lastPointsRef.current = initialLast;
      } catch (err) {
        console.error("Failed to fetch active sessions:", err);
      }
    };

    fetchActive();

    // Realtime updates
    const onUserLocation = ({ userId, latitude, longitude, timestamp, ...rest }) => {
      setUsers((prev) => {
        const idx = prev.findIndex((u) => u.userId === userId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...rest, latitude, longitude, timestamp };
          return updated;
        }
        return [...prev, { userId, latitude, longitude, timestamp, ...rest }];
      });

      setPaths((prev) => {
        const updated = { ...prev };
        if (!updated[userId]) updated[userId] = [];
        updated[userId] = [...updated[userId], [latitude, longitude]];
        return updated;
      });

      // 🔹 Hitung speed
        // 🔹 Hitung speed
setSpeeds((prevSpeeds) => {
  let speedKmh = 0;
  const last = lastPointsRef.current[userId];
  const now = Number(timestamp) || Date.now();

  if (last) {
    const distKm = haversineKm(last.lat, last.lng, latitude, longitude);
    let timeH = (now - last.ts) / 3600000;

    if (timeH <= 0) timeH = 0.0000001;

    if (DEMO_MODE) {
      // 🔹 Mode demo → pakai random 20–80 km/h
      speedKmh = Math.floor(Math.random() * 60) + 20;
    } else {
      // 🔹 Mode real GPS
      speedKmh = distKm / timeH;
      if (distKm < MIN_DIST_KM || speedKmh > MAX_SPEED_KMH) {
        speedKmh = 0;
      }
    }
  }

  // simpan titik terakhir setelah perhitungan
  lastPointsRef.current[userId] = { lat: latitude, lng: longitude, ts: now };

  // update max speed
  setMaxSpeeds((prevMax) => {
    const currentMax = prevMax[userId] || 0;
    return { ...prevMax, [userId]: Math.max(currentMax, speedKmh) };
  });

  return { ...prevSpeeds, [userId]: speedKmh };
});


    };

    const onRemoveUser = ({ userId }) => {
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      setPaths((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
      setSpeeds((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
      setMaxSpeeds((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
      delete lastPointsRef.current[userId];
    };

    socket.on("userLocation", onUserLocation);
    socket.on("removeUser", onRemoveUser);

    return () => {
      socket.off("userLocation", onUserLocation);
      socket.off("removeUser", onRemoveUser);
    };
  }, []);

  useEffect(() => {
    users.forEach((u) => {
      const marker = markersRef.current[u.userId];
      if (marker && marker.slideTo && u.latitude != null && u.longitude != null) {
        marker.slideTo([u.latitude, u.longitude], { duration: 1000 });
      }
    });
  }, [users]);

  const filteredUsers = users.filter(
    (u) => filter === "all" || u.role === filter
  );

  const getSpeedBadge = (speed) => {
    if (!speed) return "bg-gray-300 text-gray-700";
    if (speed < 40) return "bg-green-100 text-green-700";
    if (speed < 80) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 md:w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Online Users</h2>

        <div className="mb-4 flex gap-2">
          {["all", "driver", "guide"].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-2 py-1 rounded text-sm ${
                filter === role
                  ? role === "all"
                    ? "bg-blue-500 text-white"
                    : role === "driver"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                  : "bg-white border"
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {filteredUsers.map((u) => (
          <div
            key={u.userId}
            className="p-3 mb-3 bg-white rounded shadow cursor-pointer hover:bg-blue-100"
            onClick={() => setFocus({ lat: u.latitude, lng: u.longitude })}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{u.username}</p>
                <p className="text-sm text-gray-600 capitalize">{u.role}</p>
                {u.job && (
                  <p className="text-xs text-gray-500">
                    {u.job.destination} ({new Date(u.job.date).toLocaleDateString()})
                  </p>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-1 block rounded text-xs font-bold ${getSpeedBadge(
                    speeds[u.userId]
                  )}`}
                >
                  🚗 {speeds[u.userId] ? speeds[u.userId].toFixed(1) : 0} km/h
                </span>
                <span className="text-xs text-gray-500">
                  ⬆ Max: {maxSpeeds[u.userId] ? maxSpeeds[u.userId].toFixed(1) : 0} km/h
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="w-2/3 md:w-3/4">
        <MapContainer center={[-2.5, 118]} zoom={5} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {focus && <RecenterMap lat={focus.lat} lng={focus.lng} />}

          {filteredUsers
            .filter((u) => u.latitude != null && u.longitude != null)
            .map((u) => (
              <Marker
                key={u.userId}
                position={[u.latitude, u.longitude]}
                icon={u.role === "driver" ? redIcon : greenIcon}
                ref={(el) => {
                  if (el) markersRef.current[u.userId] = el;
                }}
              >
                <Popup>
                  <strong>{u.username}</strong>
                  <br />
                  Role: {u.role}
                  <br />
                  {u.job && (
                    <>
                      Destination: {u.job.destination}
                      <br />
                      Date: {new Date(u.job.date).toLocaleDateString()}
                    </>
                  )}
                  <br />
                  <strong>
                    🚗 Speed: {speeds[u.userId] ? speeds[u.userId].toFixed(1) : 0} km/h
                  </strong>
                  <br />
                  <span>
                    ⬆ Max Speed: {maxSpeeds[u.userId] ? maxSpeeds[u.userId].toFixed(1) : 0} km/h
                  </span>
                </Popup>
              </Marker>
            ))}

          {filteredUsers.map((u) => {
            const path = paths[u.userId] || [];
            return path.length > 1 ? (
              <Polyline
                key={`poly-${u.userId}`}
                positions={path}
                color={u.role === "driver" ? "#007bff" : "#00c851"}
                weight={5}
                opacity={0.8}
              />
            ) : null;
          })}
        </MapContainer>
      </div>
    </div>
  );
}
