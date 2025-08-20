import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function RouteModal({ session, onClose }) {
  if (!session) return null;

  const { points = [], streets = [], totalDistanceKm = 0, userId, role } = session;

  const start = points[0];
  const end = points[points.length - 1];
  const polyline = points.map((p) => [p.latitude, p.longitude]);

  const iconBlue = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const iconRed = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 p-4 rounded shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
        >
          Close
        </button>

        <h3 className="text-lg font-bold mb-2">
          Route History - {userId?.username} ({role})
        </h3>
        <p className="mb-2 text-sm text-gray-600">
          Total Distance: {totalDistanceKm.toFixed(2)} km
        </p>

        {/* Map */}
        <div className="h-96 mb-4">
          <MapContainer
            center={start ? [start.latitude, start.longitude] : [-2.5, 118]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {polyline.length > 0 && (
              <Polyline positions={polyline} color="blue" />
            )}
            {start && (
              <Marker position={[start.latitude, start.longitude]} icon={iconBlue}>
                <Popup>Start Point</Popup>
              </Marker>
            )}
            {end && (
              <Marker position={[end.latitude, end.longitude]} icon={iconRed}>
                <Popup>End Point</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* List nama jalan */}
        <div className="max-h-40 overflow-y-auto border p-2 rounded text-sm">
          <h4 className="font-semibold mb-1">Streets Taken:</h4>
          {streets.length > 0 ? (
            <ul className="list-disc ml-5">
              {streets.map((s, idx) => (
                <li key={idx}>{s.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No street data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
