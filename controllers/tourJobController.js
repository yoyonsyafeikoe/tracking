const TourJob = require('../models/TourJob');
const User = require('../models/User');

module.exports = (io) => ({
  createJob: async (req, res) => {
    const { jobDate, adminId, driverId, guideId, destination } = req.body;

    try {
      const job = new TourJob({
        jobDate,
        adminId,
        driverId,
        guideId,
        destination,
        status: 'on schedule',
      });

      await job.validate();
      await job.save();

      io.emit('jobAssigned', { driverId, guideId });

      res.status(201).json({ message: 'Tour job created', job });
    } catch (err) {
      console.error('❌ Failed to create job:', err);
      res.status(500).json({ message: 'Failed to create job', error: err.message });
    }
  },

  getJobList: async (req, res) => {
    const { driverId, guideId, status, fromDate, toDate } = req.query;

    const filter = {};
    if ((driverId || guideId) && !status) {
      filter.status = { $ne: 'completed' };
    }
    if (driverId) filter.driverId = driverId;
    if (guideId) filter.guideId = guideId;
    if (status) filter.status = status;

    if (fromDate || toDate) {
      filter.jobDate = {};
      if (fromDate) {
        const from = new Date(fromDate);
        if (!isNaN(from)) filter.jobDate.$gte = from;
      }
      if (toDate) {
        const to = new Date(toDate);
        if (!isNaN(to)) filter.jobDate.$lte = to;
      }
      if (Object.keys(filter.jobDate).length === 0) {
        delete filter.jobDate;
      }
    }

    try {
      const jobs = await TourJob.find(filter)
        .populate('driverId', 'username')
        .populate('guideId', 'username')
        .populate('adminId', 'username')
        .sort({ jobDate: -1 });

      res.json(jobs);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
    }
  },

  updateJobStatus: async (req, res) => {
    const { jobId } = req.params;
    const { status } = req.body;

    try {
      const updatedJob = await TourJob.findByIdAndUpdate(
        jobId,
        { status },
        { new: true }
      );

      if (!updatedJob) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.json({ message: 'Job status updated', job: updatedJob });
    } catch (error) {
      console.error('Error updating job status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
});
