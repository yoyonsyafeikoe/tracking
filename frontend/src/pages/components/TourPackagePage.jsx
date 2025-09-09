import { useState, useEffect } from "react";
import axios from "axios";

export default function TourPackagePage({ onBack, initialData }) {
  const [hotels, setHotels] = useState([]); // list hotel dari backend

  const [formData, setFormData] = useState({
    package_name: "",
    hotels: [],
    destinations: [
      {
        place: "",
        itineraries: [{ day: 1, activity: "" }],
      },
    ],
    capacity: "",
    price: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 fetch hotels untuk dropdown
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/hotels")
      .then((res) => setHotels(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🔹 kalau edit, isi form
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
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
      if (initialData?._id) {
        await axios.put(
          `http://localhost:5000/api/tour-packages/${initialData._id}`,
          formData
        );
        setMessage("✅ Tour Package updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/tour-packages", formData);
        setMessage("✅ Tour Package added successfully!");
      }
      if (onBack) onBack(); // balik ke list
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to save Tour Package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {initialData ? "✏️ Edit Tour Package" : "🏝️ Add Tour Package"}
        </h2>
        <button type="button" onClick={onBack} className="btn-main">
          ← Back to List
        </button>
      </div>

      {/* Notif */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kiri */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Package Name</label>
              <input
                type="text"
                name="package_name"
                value={formData.package_name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Hotels</label>
              <select
                multiple
                value={formData.hotels}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hotels: Array.from(
                      e.target.selectedOptions,
                      (opt) => opt.value
                    ),
                  })
                }
                className="w-full border rounded px-3 py-2 h-28"
              >
                {hotels.map((hotel) => (
                  <option key={hotel._id} value={hotel._id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanan */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="1"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Destinations + Itinerary */}
        <div>
          <label className="block font-medium mb-2">Destinations</label>
          {formData.destinations.map((dest, destIdx) => (
            <div
              key={destIdx}
              className="border rounded p-3 mb-3 bg-gray-50 space-y-2"
            >
              <input
                type="text"
                placeholder="Destination name"
                value={dest.place}
                onChange={(e) => {
                  const newDest = [...formData.destinations];
                  newDest[destIdx].place = e.target.value;
                  setFormData({ ...formData, destinations: newDest });
                }}
                className="w-full border rounded px-2 py-1 mb-2"
              />

              {dest.itineraries.map((it, itIdx) => (
                <div key={itIdx} className="flex gap-2 mb-2">
                  <input
                    type="number"
                    min="1"
                    value={it.day}
                    onChange={(e) => {
                      const newDest = [...formData.destinations];
                      newDest[destIdx].itineraries[itIdx].day = e.target.value;
                      setFormData({ ...formData, destinations: newDest });
                    }}
                    className="w-20 border rounded px-2 py-1"
                    placeholder="Day"
                  />
                  <input
                    type="text"
                    placeholder="Activity"
                    value={it.activity}
                    onChange={(e) => {
                      const newDest = [...formData.destinations];
                      newDest[destIdx].itineraries[itIdx].activity =
                        e.target.value;
                      setFormData({ ...formData, destinations: newDest });
                    }}
                    className="flex-1 border rounded px-2 py-1"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const newDest = [...formData.destinations];
                  newDest[destIdx].itineraries.push({
                    day: newDest[destIdx].itineraries.length + 1,
                    activity: "",
                  });
                  setFormData({ ...formData, destinations: newDest });
                }}
                className="btn-outline mt-2"
              >
                + Itenaries
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                destinations: [
                  ...formData.destinations,
                  { place: "", itineraries: [{ day: 1, activity: "" }] },
                ],
              })
            }
            className="btn-outline mt-2"
          >
            + Add Destination
          </button>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 h-28"
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : initialData ? "Update Package" : "Add Package"}
          </button>
        </div>
      </form>
    </div>
  );
}
