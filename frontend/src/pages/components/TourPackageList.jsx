import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaEdit, FaTrash } from "react-icons/fa";
import ConfirmModal from "./common/ConfirmModal";

export default function TourPackageList({ onAdd,onEdit }) {
  const [packages, setPackages] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [error, setError] = useState("");
  const [expandedDest, setExpandedDest] = useState({});

  const toggleDest = (idx) => {
    setExpandedDest((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tour-packages");
        setPackages(res.data);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch tour packages.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const openDeleteModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  /*const handleDelete = async (id) => {
    if (!window.confirm("Delete this tour package?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tour-packages/${id}`);
      setPackages(packages.filter((p) => p._id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete package.");
    }
  };*/

  const handleDelete = async () => {
    if (!selectedPackage) return;
    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/tour-packages/${selectedPackage._id}`
      );
      setPackages(packages.filter((p) => p._id !== selectedPackage._id));
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus paket tour.");
    } finally {
      setLoading(false);
      setShowModal(false);
      setSelectedPackage(null);
    }
  };

  if (loading)
    return <div className="p-6 bg-white rounded-lg shadow">Loading...</div>;
  if (error)
    return (
      <div className="p-6 bg-white rounded-lg shadow text-red-600">{error}</div>
    );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Tour Packages</h2>
        <button onClick={onAdd} className="btn-main">
          + Add Tour Package
        </button>
      </div>

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Package Name</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-right">Price</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <Fragment key={pkg._id}>
              <tr className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{pkg.package_name}</td>
                <td className="p-3">{pkg.description}</td>
                <td className="p-3 text-right">
                  {pkg.price?.toLocaleString("id-ID")}
                </td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => toggleExpand(pkg._id)} className="btn-outline">
                      {expandedRow === pkg._id ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button onClick={() => onEdit(pkg)} className="btn-outline">
                      <FaEdit />
                    </button>
                    <button onClick={() => openDeleteModal(pkg)} className="btn-outline text-red-600 hover:bg-red-50">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>

              {expandedRow === pkg._id && (
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-4">
                    <div className="space-y-4 text-sm">

                      {/* Informasi umum */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p>
                          <strong>Capacity:</strong> {pkg.capacity}
                        </p>
                        <p>
                          <strong>Status:</strong> {pkg.status}
                        </p>
                        <p className="md:col-span-2">
                          <strong>Description:</strong>{" "}
                          {pkg.description || "-"}
                        </p>
                      </div>

                      {/* Hotels */}
                      {pkg.hotels && pkg.hotels.length > 0 && (
                        <div>
                          <strong>Hotels:</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {pkg.hotels.map((hotel) => (
                              <li key={hotel._id}>
                                {hotel.name} — {hotel.address} ({hotel.phone})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Destinations & Itinerary */}
                      {pkg.destinations && pkg.destinations.length > 0 && (
                        <div>
                          <strong>Destinations & Itinerary:</strong>
                          <div className="space-y-3 mt-2">
                            {pkg.destinations.map((dest, idx) => (
                              <div
                                key={idx}
                                className="border rounded-lg p-3 bg-white shadow-sm"
                              >
                                {/* Header destinasi */}
                                <div className="flex justify-between items-center">
                                  <h4 className="font-semibold text-blue-600">
                                    {dest.place}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => toggleDest(idx)}
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {expandedDest[idx] ? "Hide itinerary ▲" : "View itinerary ▼"}
                                  </button>
                                </div>

                                {/* Itinerary */}
                                {expandedDest[idx] && (
                                  <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
                                    {dest.itineraries && dest.itineraries.length > 0 ? (
                                      dest.itineraries.map((it, itIdx) => (
                                        <li key={itIdx}>{it.activity}</li>
                                      ))
                                    ) : (
                                      <li className="text-gray-500 italic">
                                        No itinerary added
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}

            </Fragment>
          ))}
        </tbody>
      </table>
      {/* ✅ Modal konfirmasi reusable */}
      <ConfirmModal
        isOpen={showModal}
        title="Konfirmasi Hapus Paket Tour"
        message={`Are you sure you want to delete tour package "${
          selectedPackage?.package_name || ""
        }"? This action cannot be undone!.`}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
        loading={loading}
      />
    </div>
  );
}
