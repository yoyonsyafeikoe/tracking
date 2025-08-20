import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function JobHistoryTable() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs/list?status=completed");
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Completed Jobs</h2>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Destination</th>
            <th className="p-2">Date</th>
            <th className="p-2">Driver</th>
            <th className="p-2">Guide</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id} className="border-t">
              <td className="p-2">{job.destination}</td>
              <td className="p-2">
                {new Date(job.jobDate).toLocaleDateString()}
              </td>
              <td className="p-2">{job.driver?.username || "-"}</td>
              <td className="p-2">{job.guide?.username || "-"}</td>
              <td className="p-2">
                <button
                  onClick={() => navigate(`/admin/job/${job._id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  View Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
