import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function HotelList({ onAdd, onEdit }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/hotels");
        setHotels(res.data);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch hotels.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/hotels/${id}`);
      setHotels(hotels.filter((h) => h._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete hotel");
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
        <h2 className="text-2xl font-semibold">Hotels</h2>
        <button onClick={onAdd} className="btn-main">
          Add Hotel
        </button>
      </div>

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Hotel Name</th>
            <th className="p-3 text-left">Address</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <Fragment key={hotel._id}>
              <tr className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{hotel.name}</td>
                <td className="p-3">{hotel.address}</td>
                <td className="p-3">{hotel.phone}</td>
                <td className="p-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onEdit(hotel)}  // ✅ prop onEdit dipanggil
                      className="btn-outline"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(hotel._id)}
                      className="btn-outline"
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
    </div>
  );
}
