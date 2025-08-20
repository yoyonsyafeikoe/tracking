import { useEffect, useState } from 'react';
import API from '../../api/api';

export default function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [filters, setFilters] = useState({
    driverId: '',
    guideId: '',
    status: '',
    fromDate: '',
    toDate: ''
  });

  const fetchJobs = async () => {
    try {
      const query = new URLSearchParams();
	    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        query.append(key, value);
      }
  });
      const res = await API.get(`/jobs/list?${query}`);
      setJobs(res.data);
    } catch (err) {
      console.error('Fetch jobs failed', err);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [driverRes, guideRes] = await Promise.all([
          API.get('/users?role=driver'),
          API.get('/users?role=guide')
        ]);
        setDrivers(driverRes.data);
        setGuides(guideRes.data);
      } catch (err) {
        console.error('Error loading users', err);
      }
    };
    fetchUsers();
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Job History</h2>

      {/* Filters */}
      <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <select name="driverId" value={filters.driverId} onChange={handleChange} className="border p-2 rounded">
          <option value="">All Drivers</option>
          {drivers.map(d => (
            <option key={d._id} value={d._id}>{d.username}</option>
          ))}
        </select>

        <select name="guideId" value={filters.guideId} onChange={handleChange} className="border p-2 rounded">
          <option value="">All Guides</option>
          {guides.map(g => (
            <option key={g._id} value={g._id}>{g.username}</option>
          ))}
        </select>

        <select name="status" value={filters.status} onChange={handleChange} className="border p-2 rounded">
          <option value="">All Status</option>
          <option value="on schedule">On Schedule</option>
          <option value="completed">Completed</option>
          <option value="cancel">Cancel</option>
        </select>

        <input type="date" name="fromDate" value={filters.fromDate} onChange={handleChange} className="border p-2 rounded" />
        <input type="date" name="toDate" value={filters.toDate} onChange={handleChange} className="border p-2 rounded" />

        <button type="submit" className="col-span-1 md:col-span-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-center">
          Apply Filters
        </button>
      </form>

      {/* Job Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 font-semibold">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Destination</th>
              <th className="px-4 py-2">Driver</th>
              <th className="px-4 py-2">Guide</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">No jobs found.</td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{job.jobDate?.slice(0, 10)}</td>
                <td className="px-4 py-2">{job.destination}</td>
                <td className="px-4 py-2">{job.driverId?.username || '-'}</td>
                <td className="px-4 py-2">{job.guideId?.username || '-'}</td>
                <td className="px-4 py-2 capitalize">{job.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
