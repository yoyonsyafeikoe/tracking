// src/components/TourJobPage.jsx
import { useState, useEffect } from "react";
import API from "../../api/api";

export default function TourJobPage({ onBack, initialData }) {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState({
    jobDate: "",
    tourPackageId: "",
    customerName: "",
    customerPhone: "",
    driverId: "",
    guideId: "",
  });

  const [drivers, setDrivers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Isi form kalau sedang edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        jobDate: initialData.jobDate?.split("T")[0] || "",
        tourPackageId: initialData.tourPackageId?._id || "",
        customerName: initialData.customerName || "",
        customerPhone: initialData.customerPhone || "",
        driverId: initialData.driverId?._id || "",
        guideId: initialData.guideId?._id || "",
      });
    }
  }, [initialData]);

  // Ambil data driver, guide, dan package
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driverRes, guideRes, packageRes] = await Promise.all([
          API.get("/users?role=driver"),
          API.get("/users?role=guide"),
          API.get("/tour-packages"),
        ]);
        setDrivers(driverRes.data);
        setGuides(guideRes.data);
        setPackages(packageRes.data);
      } catch (err) {
        console.error("❌ Failed fetching dropdown data:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isEditMode) {
        // Mode EDIT → PUT
        await API.put(`/jobs/${initialData._id}`, formData);
        setMessage("✅ Tour Job updated successfully!");
      } else {
        // Mode ADD → POST
        await API.post("/jobs/create", {
          ...formData,
          status: "on schedule",
          adminId: "680b4581df0ed4a8cb60e781",
        });
        setMessage("✅ Tour Job created successfully!");
        setFormData({
          jobDate: "",
          tourPackageId: "",
          customerName: "",
          customerPhone: "",
          driverId: "",
          guideId: "",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage(
        isEditMode
          ? "❌ Failed to update Tour Job. Please try again."
          : "❌ Failed to create Tour Job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isEditMode ? "✏️ Edit Tour Job" : "➕ Add Tour Job"}
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
        >
          ← Back to List
        </button>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Job Date
            </label>
            <input
              type="date"
              name="jobDate"
              value={formData.jobDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Tour Package */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tour Package
            </label>
            <select
              name="tourPackageId"
              value={formData.tourPackageId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">-- Select Package --</option>
              {packages.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.package_name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Customer Phone
            </label>
            <input
              type="text"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Driver */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select Driver
            </label>
            <select
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">-- Select Driver --</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.username}
                </option>
              ))}
            </select>
          </div>

          {/* Guide */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select Guide
            </label>
            <select
              name="guideId"
              value={formData.guideId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">-- Select Guide --</option>
              {guides.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-2 rounded ${
            loading
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : isEditMode
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading
            ? "Saving..."
            : isEditMode
            ? "Update Tour Job"
            : "Create Tour Job"}
        </button>
      </form>
    </div>
  );
}
