import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";

export default function ViewRoute() {
  const { id } = useParams();
  const [route, setRoute] = useState([]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await API.get(`/tracking/job/${id}`);
        if (res.data?.session?.points?.length > 0) {
          const points = res.data.session.points.map((p) => [p.latitude, p.longitude]);
          setRoute(points);
        }
      } catch (err) {
        console.error("Gagal ambil detail session:", err);
      }
    };
    fetchSession();
  }, [id]);

  return (
    <div className="h-screen w-full">
      <MapContainer center={[-7.77, 110.37]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {route.length > 0 && <Polyline positions={route} color="blue" />}
        {route.length > 0 && (
          <Marker position={route[0]}>
            <Popup>Start</Popup>
          </Marker>
        )}
        {route.length > 0 && (
          <Marker position={route[route.length - 1]}>
            <Popup>End</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
