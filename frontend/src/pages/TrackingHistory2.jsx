// src/pages/TrackingHistory.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

export default function TrackingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tracking/history");
      if (res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error("Gagal ambil tracking history:", err);
      setError("Gagal memuat data tracking history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return <p className="p-4 text-gray-600">Memuat data tracking...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Tracking History</h2>
        <button
          onClick={fetchHistory}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500">Belum ada data tracking tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 shadow rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="p-3 border">No</th>
                <th className="p-3 border">Destination</th>
                <th className="p-3 border">Driver</th>
                <th className="p-3 border">Guide</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Total Distance</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr
                  key={h._id}
                  className={`text-center text-sm ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">
                    {h.jobId?.destination || "-"}
                  </td>
                  <td className="p-2 border">
                    {h.jobId?.driverId?.username || "-"}
                  </td>
                  <td className="p-2 border">
                    {h.jobId?.guideId?.username || "-"}
                  </td>
                  <td className="p-2 border">
                    {h.jobId?.jobDate
                      ? new Date(h.jobId.jobDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2 border font-semibold text-blue-600">
                    {h.totalDistanceKm
                      ? `${h.totalDistanceKm.toFixed(2)} km`
                      : "0 km"}
                  </td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        h.jobId?.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : h.jobId?.status === "cancel"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {h.jobId?.status || "-"}
                    </span>
                  </td>
                  <td className="p-2 border">
                    <Link
                      to={`/tracking/${h._id}`}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      View Route
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
