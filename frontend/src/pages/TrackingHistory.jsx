// src/pages/TrackingHistory.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function TrackingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

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
      <h2 className="text-xl font-bold mb-4">Tracking History</h2>

      {history.length === 0 ? (
        <p className="text-gray-500">No tracking data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 shadow rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="p-3 border">No</th>
                <th className="p-3 border">Customer</th>
                <th className="p-3 border">Package</th>
                <th className="p-3 border">Job Date</th>
                <th className="p-3 border">Total Distance</th>
                <th className="p-3 border">Expand</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => {
                const job = h.jobId;
                const pkg = job?.tourPackageId;
                return (
                  <React.Fragment key={h._id}>
                    {/* Main row */}
                    <tr
                      className={`text-center text-sm cursor-pointer ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                      onClick={() =>
                        setExpanded(expanded === h._id ? null : h._id)
                      }
                    >
                      <td className="p-2 border">{i + 1}</td>
                      <td className="p-2 border">
                        {job?.customerName || "-"}
                        <br />
                        <span className="text-xs text-gray-500">
                          {job?.customerPhone || ""}
                        </span>
                      </td>
                      <td className="p-2 border">{pkg?.package_name || "-"}</td>
                      <td className="p-2 border">
                        {job?.jobDate
                          ? new Date(job.jobDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-2 border font-semibold text-blue-600">
                        {h.totalDistanceKm
                          ? `${h.totalDistanceKm.toFixed(2)} km`
                          : "0 km"}
                      </td>
                      <td className="p-2 border text-lg">
                        {expanded === h._id ? <FaChevronUp /> : <FaChevronDown />}
                      </td>
                    </tr>

                    {/* Expand row */}
                    {expanded === h._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="p-4 text-left">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left info */}
                            <div className="bg-white rounded-lg shadow p-4 space-y-2">
                              <p className="text-sm">
                                <span className="font-semibold">Driver:</span>{" "}
                                {job?.driverId?.username || "-"}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Guide:</span>{" "}
                                {job?.guideId?.username || "-"}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Hotel:</span>{" "}
                                {pkg?.hotels?.length
                                  ? pkg.hotels
                                      .map((h) =>
                                        typeof h === "object" ? h.name : h
                                      )
                                      .join(", ")
                                  : "-"}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Price:</span>{" "}
                                {pkg?.price
                                  ? `$${pkg.price.toLocaleString()}`
                                  : "-"}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">
                                  Description:
                                </span>{" "}
                                {pkg?.description || "-"}
                              </p>
                            </div>

                            {/* Right info: destinations */}
                            <div className="bg-white rounded-lg shadow p-4">
                              <h4 className="font-semibold mb-2">
                                Destinations
                              </h4>
                              {pkg?.destinations?.length > 0 ? (
                                <div className="space-y-3">
                                  {pkg.destinations.map((dest) => (
                                    <div
                                      key={dest._id}
                                      className="p-3 border rounded-lg"
                                    >
                                      <h5 className="font-medium text-gray-800">
                                        {dest.place}
                                      </h5>
                                      <ul className="list-disc list-inside text-sm text-gray-600">
                                        {dest.itineraries?.map((it, idx) => (
                                          <li key={idx}>{it.activity}</li>
                                        ))}
                                      </ul>
                                      <div className="mt-2">
                                        <Link
                                          to={`/tracking/${h._id}?destinationId=${dest._id}`}
                                          className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
                                        >
                                          View Route
                                        </Link>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No destinations available.
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
