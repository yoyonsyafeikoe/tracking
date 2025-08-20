import { useEffect, useState } from 'react';
import API from '../api/api';
import socket from '../utils/socket';
import { FaPlay, FaStop } from 'react-icons/fa';

export default function DriverDashboard() {
  const [jobs, setJobs] = useState([]);
  const [trackingJobId, setTrackingJobId] = useState(null);
  const [watchIds, setWatchIds] = useState({});
  const userId = localStorage.getItem('userId');

  const fetchJobs = async () => {
    try {
      const res = await API.get(`/jobs/list?driverId=${userId}&status=on schedule`);
      const sorted = [...res.data].sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate));
      setJobs(sorted);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };
  
  useEffect(() => {
    const userid = localStorage.getItem('userId');
    if (!userid) {
      console.warn('No userId found in localStorage');
      return;
    }
  
    fetchJobs();
  }, []);

  useEffect(() => {
    const jobId = localStorage.getItem('trackingJobId');
    
    if (jobId && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          socket.emit('locationUpdate', {
            userId,
            jobId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
      setWatchIds((prev) => ({ ...prev, [jobId]: watchId }));
      setTrackingJobId(jobId);
    }
  }, []);

  useEffect(() => {
    const savedJobId = localStorage.getItem(`trackingJobId_${userId}`);

    if (savedJobId) {
      setTrackingJobId(savedJobId);
    }
  }, []);

  useEffect(() => {
    socket.on('jobAssigned', ({ driverId }) => {
      const uid = localStorage.getItem('userId');
      if (driverId === uid) {
        fetchJobs(); 
      }
    });
  
    return () => socket.off('jobAssigned');
  }, [userId]);
  
  const handleStartTracking = (jobId) => {
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          socket.emit('locationUpdate', {
            userId,
            jobId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
      setWatchIds((prev) => ({ ...prev, [jobId]: id }));
      setTrackingJobId(jobId);
      localStorage.setItem(`trackingJobId_${userId}`, jobId);

    } else {
      alert('Geolocation is not supported by your device.');
    }
  };

  const handleStopTracking = async (jobId) => {
    const watchId = watchIds[jobId];
    
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
  
      // Optionally emit one last location update
      navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit('locationUpdate', {
          userId,
          jobId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      });
  
      try {
        // ✅ Mark job as completed on the backend
        await API.patch(`/jobs/${jobId}/status`, { status: 'completed' });
  
        // ✅ Refresh job list
        const res = await API.get(`/jobs/list?driverId=${userId}&status=on schedule`);
        const sorted = [...res.data].sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate));
        setJobs(sorted);
      } catch (err) {
        console.error('Failed to update job status or refresh list:', err);
      }

      localStorage.removeItem('trackingJobId');
      setTrackingJobId(null);
      //delete watchIds[jobId];
      setWatchIds({ ...watchIds });
      await API.delete(`/tracking/active/${userId}`);
      socket.emit('userStopped', { userId });

    } else {
      console.warn('No watchId found for this job.');
    }
    
  };   

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <div
          key={job._id}
          className="rounded-2xl p-4 shadow-md text-white"
          style={{
            background: 'linear-gradient(135deg, #a770ef, #cf8bf3, #fdb99b)',
          }}
        >
          <h3 className="text-xl font-semibold mb-1">{job.destination}</h3>
          <p className="text-sm mb-4">{new Date(job.jobDate).toLocaleDateString()}</p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {trackingJobId !== job._id ? (
                <button
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white"
                  onClick={() => handleStartTracking(job._id)}
                >
                  <FaPlay />
                </button>
              ) : (
                <button 
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
                  onClick={() => handleStopTracking(job._id)}
                >
                  <FaStop />
                </button>
              )}
            </div>
            <span className="text-sm">{job.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
