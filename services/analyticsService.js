// services/analyticsService.js
const axios = require('axios');
const Papa = require('papaparse');

const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDBs9ikUoPOqYhknvr1OnQLHSIX8ZdRDNFUc7DhC-3yUDJqoF1Sb7omOAtL9SK3LRLRpGJ0VPjCMPU/pub?output=csv&cachebust=1';

async function fetchAnalyticsData() {
  const res = await axios.get(sheetURL);
  const csv = res.data;

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        try {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          let bookings = 0, progress = 0, revenue = 0;
          const lineData = {}, pieData = {}, revTable = {}, progressTable = [];

          data.forEach(row => {
            const date = new Date(row.Date);
            const dest = row.Destination;
            const guide = row.Guide;
            const rev = parseFloat(row.Revenue);
            const status = row.Status?.toLowerCase();

            if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
              bookings++;
              if (!isNaN(rev)) revenue += rev;

              pieData[dest] = (pieData[dest] || 0) + 1;
              revTable[dest] = (revTable[dest] || 0) + (isNaN(rev) ? 0 : rev);

              const day = date.toISOString().split('T')[0];
              lineData[day] = (lineData[day] || 0) + 1;
            }

            if (status?.includes('progress')) {
              progress++;
              progressTable.push({ guide, dest });
            }
          });

          resolve({
            summary: { bookings, progress, revenue },
            lineData,
            pieData,
            progressTable,
            revenueTable: Object.entries(revTable).map(([dest, rev]) => ({ dest, rev }))
          });
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
}

module.exports = { fetchAnalyticsData };
