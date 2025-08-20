const express = require('express');

module.exports = (controller) => {
  const router = express.Router();

  console.log('✅ controller.createJob is', typeof controller.createJob); 

  router.post('/create', controller.createJob);
  router.get('/list', controller.getJobList);
  router.patch('/:jobId/status', controller.updateJobStatus);

  return router;
};
