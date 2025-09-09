import { useState, useEffect } from "react";
import axios from "axios";

export default function HotelPage({ onBack, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Jika ada initialData (edit mode), isi form dengan datanya
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
      });
    }
  }, [initialData]);

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
      if (initialData) {
        // 🔹 Update hotel
        await axios.put(
          `http://localhost:5000/api/hotels/${initialData._id}`,
          formData
        );
        setMessage("✅ Hotel updated successfully!");
      } else {
        // 🔹 Add new hotel
        await axios.post("http://localhost:5000/api/hotels", formData);
        setMessage("✅ Hotel added successfully!");
      }

      // Setelah berhasil → balik ke list
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to save hotel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {initialData ? "✏️ Edit Hotel" : "🏨 Add Hotel"}
        </h2>
        <button type="button" onClick={onBack} className="btn-main">
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
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Hotel Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition`}
          >
            {loading
              ? "Saving..."
              : initialData
              ? "Update Hotel"
              : "Add Hotel"}
          </button>
        </div>
      </form>
    </div>
  );
}
