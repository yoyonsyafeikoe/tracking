// controllers/analyticsController.js
/*const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');

const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDBs9ikUoPOqYhknvr1OnQLHSIX8ZdRDNFUc7DhC-3yUDJqoF1Sb7omOAtL9SK3LRLRpGJ0VPjCMPU/pub?output=csv';

async function fetchCSVData() {
  const response = await axios.get(sheetURL);
  const results = [];

  return new Promise((resolve, reject) => {
    Readable.from(response.data)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}*/

/*module.exports = (io) => {
  // Periodically emit to clients
  setInterval(async () => {
    try {
      const data = await fetchCSVData();
      io.emit('analyticsUpdate', data);
    } catch (err) {
      console.error('❌ Failed to fetch analytics data:', err.message);
    }
  }, 7000); // 7 seconds
};*/
