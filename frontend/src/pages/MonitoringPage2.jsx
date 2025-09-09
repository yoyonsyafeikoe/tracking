import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap,Polyline } from 'react-leaflet';
import L from 'leaflet';
import socket from '../utils/socket';
import 'leaflet/dist/leaflet.css';
import 'leaflet.marker.slideto';
import API from '../api/api';

//L.Marker.include(require("leaflet.marker.slideto/src/Marker.SlideTo.js"));

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13);
    }
  }, [lat, lng]);
  return null;
}

// Custom icons
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MonitoringPage() {
  const [users, setUsers] = useState([]);
  const [focus, setFocus] = useState(null);
  const [paths, setPaths] = useState({}); // ✅ Tambah state polyline
  const [filter, setFilter] = useState('all'); // 'all', 'driver', 'guide'
  const markersRef = useRef({});

  useEffect(() => {
    // Ambil sesi aktif dari backend
    const fetchActive = async () => {
      try {
        const res = await API.get('/tracking/active');
        setUsers(res.data);
        // Inisialisasi path awal tiap user
        const initialPaths = {};
        res.data.forEach((u) => {
          if (u.latitude && u.longitude) {
            initialPaths[u.userId] = [[u.latitude, u.longitude]];
          }
        });
        setPaths(initialPaths);
      } catch (err) {
        console.error('Failed to fetch active sessions:', err);
      }
    };
    fetchActive();

    socket.on('userLocation', (newData) => {
      // Update posisi user di state users
      setUsers((prev) => {
        const index = prev.findIndex((u) => u.userId === newData.userId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...prev[index], ...newData };
          return updated;
        } else {
          return [...prev, newData];
        }
      });

      // Update paths untuk polyline
      setPaths((prevPaths) => {
        const updatedPaths = { ...prevPaths };
        if (!updatedPaths[newData.userId]) {
          updatedPaths[newData.userId] = [];
        }
        updatedPaths[newData.userId] = [
          ...updatedPaths[newData.userId],
          [newData.latitude, newData.longitude]
        ];
        return updatedPaths;
      });
    });

    socket.on('removeUser', ({ userId }) => {
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    return () => {
      socket.off('userLocation');
      socket.off('removeUser');
    };
  }, []);

  // Animasi marker smooth
  useEffect(() => {
    users.forEach((user) => {
      const marker = markersRef.current[user.userId];
      if (marker && marker.slideTo && user.latitude && user.longitude) {
        marker.slideTo([user.latitude, user.longitude], {
          duration: 1000,
          keepAtCenter: false,
        });
      }
    });
  }, [users]);

  const filteredUsers = users.filter(
    (u) => filter === 'all' || u.role === filter
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 md:w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Online Users</h2>

        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 rounded text-sm ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white border'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('driver')}
            className={`px-2 py-1 rounded text-sm ${
              filter === 'driver'
                ? 'bg-red-500 text-white'
                : 'bg-white border'
            }`}
          >
            Driver
          </button>
          <button
            onClick={() => setFilter('guide')}
            className={`px-2 py-1 rounded text-sm ${
              filter === 'guide'
                ? 'bg-green-500 text-white'
                : 'bg-white border'
            }`}
          >
            Guide
          </button>
        </div>

        {filteredUsers.map((u) => (
          <div
            key={u.userId}
            className="p-2 mb-2 bg-white rounded shadow cursor-pointer hover:bg-blue-100"
            onClick={() => setFocus({ lat: u.latitude, lng: u.longitude })}
          >
            <p className="font-semibold">{u.username}</p>
            <p className="text-sm text-gray-600 capitalize">{u.role}</p>
            {u.job && (
              <p className="text-xs text-gray-500">
                {u.job.destination} ({new Date(u.job.date).toLocaleDateString()})
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="w-2/3 md:w-3/4">
        <MapContainer
          center={[-2.5, 118]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
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
                  <strong>{u.username}</strong><br />
                  Role: {u.role}<br />
                  {u.job && (
                    <>
                      Destination: {u.job.destination}<br />
                      Date: {new Date(u.job.date).toLocaleDateString()}
                    </>
                  )}
                </Popup>
              </Marker>
          ))}

          {/* Polyline untuk tiap user */}
          {filteredUsers.map((u) => {
            const path = paths[u.userId] || [];
            return path.length > 1 ? (
              <Polyline
                key={`poly-${u.userId}`}
                positions={path}
                color={u.role === "driver" ? "red" : "green"}
                weight={4}
                opacity={0.7}
              />
            ) : null;
          })}

        </MapContainer>
      </div>
    </div>
  );
}
