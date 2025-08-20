// src/pages/JobHistory.jsx
import { useEffect, useState } from "react";
import API from "../api/api";
import RouteModal from "./components/RouteModal";

export default function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "",
  });
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await API.get(`/jobs/list?${query}`);
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchJobs();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Job History</h2>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Status</option>
          <option value="on schedule">On Schedule</option>
          <option value="completed">Completed</option>
          <option value="cancel">Cancel</option>
        </select>
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Search
        </button>
      </div>

      {/* Jobs Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Destination</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Driver</th>
            <th className="p-2 border">Guide</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id} className="text-center">
              <td className="p-2 border">{job.destination}</td>
              <td className="p-2 border">
                {new Date(job.jobDate).toLocaleDateString()}
              </td>
              <td className="p-2 border">{job.driver?.username}</td>
              <td className="p-2 border">{job.guide?.username}</td>
              <td className="p-2 border capitalize">{job.status}</td>
              <td className="p-2 border">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  onClick={() => setSelectedJob(job)}
                >
                  View Route
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Route Modal */}
      {selectedJob && (
        <RouteModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
