import { useEffect, useState } from 'react';
import API from '../../api/api';

export default function AddJobForm() {
  const [formData, setFormData] = useState({
    jobDate: '',
    destination: '',
    driverId: '',
    guideId: ''
  });

  const [drivers, setDrivers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch drivers and guides
    const fetchUsers = async () => {
      try {
        const [driverRes, guideRes] = await Promise.all([
          API.get('/users?role=driver'),
          API.get('/users?role=guide')
        ]);
        setDrivers(driverRes.data);
        setGuides(guideRes.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await API.post('/jobs/create', {
        ...formData,
        status: 'on schedule', // default
        adminId: '680b4581df0ed4a8cb60e781' // hardcoded for now
      });

      setSuccess(true);
      setFormData({
        jobDate: '',
        destination: '',
        driverId: '',
        guideId: ''
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Job creation failed');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-xl">
      <h2 className="text-xl font-bold mb-4">Create New Job</h2>

      {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-3">Job created successfully!</div>}
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Tour Date</label>
          <input
            type="date"
            name="jobDate"
            value={formData.jobDate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Destination</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Select Driver</label>
          <select
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- Select Driver --</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>{d.username}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Select Guide</label>
          <select
            name="guideId"
            value={formData.guideId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- Select Guide --</option>
            {guides.map((g) => (
              <option key={g._id} value={g._id}>{g.username}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Create Job
        </button>
      </form>
    </div>
  );
}
