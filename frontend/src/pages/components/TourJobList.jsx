import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function TourJobList({ onAdd, onEdit }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // State untuk modal konfirmasi
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      setJobs(res.data);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch tour jobs.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    setDeleting(true);

    try {
      await axios.delete(`http://localhost:5000/api/jobs/${selectedJob._id}`);
      setJobs(jobs.filter((job) => job._id !== selectedJob._id));
      setMessage("✅ Tour Job deleted successfully!");
    } catch (e) {
      console.error(e);
      setMessage("❌ Gagal menghapus Tour Job. Coba lagi!");
    } finally {
      setDeleting(false);
      setShowModal(false);
      setSelectedJob(null);
    }
  };

  if (loading)
    return (
      <div className="p-6 bg-white rounded-lg shadow">Loading...</div>
    );
  if (error)
    return (
      <div className="p-6 bg-white rounded-lg shadow text-red-600">
        {error}
      </div>
    );

  return (
    <div className="p-6 bg-white rounded-lg shadow relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Tour Jobs</h2>
        <button onClick={onAdd} className="btn-main">
          ➕ Add Job
        </button>
      </div>

      {/* Pesan sukses / error */}
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Package Name</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <Fragment key={job._id}>
              <tr className="border-t hover:bg-gray-50 transition">
                <td className="p-3">
                  {job.tourPackageId?.package_name || "-"}
                </td>
                <td className="p-3">{job.customerName}</td>
                <td className="p-3">{job.customerPhone}</td>
                <td className="p-3 text-right">
                  <div className="flex gap-2 justify-end">
                    {/* Tombol Edit */}
                    <button
                      onClick={() => onEdit(job)}
                      className="btn-outline"
                      title="Edit Job"
                    >
                      <FaEdit />
                    </button>

                    {/* Tombol Delete */}
                    <button
                      onClick={() => openDeleteModal(job)}
                      className="btn-outline text-red-600 hover:bg-red-50"
                      title="Delete Job"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>

      {/* === MODAL KONFIRMASI DELETE === */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Delete Tour Job
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete? <br />
              <span className="font-semibold text-gray-800">
                {selectedJob?.customerName}
              </span>{" "}
              with package{" "}
              <span className="font-semibold text-gray-800">
                {selectedJob?.tourPackageId?.package_name || "-"}
              </span>
              ? <br />This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedJob(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`px-4 py-2 rounded-lg text-white ${
                  deleting
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
