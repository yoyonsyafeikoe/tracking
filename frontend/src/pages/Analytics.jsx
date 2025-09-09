import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, PieController, ArcElement, Filler } from 'chart.js';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, PieController, ArcElement, Filler);

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

export default function AdminAnalytics() {
  const [summary, setSummary] = useState({ bookings: 0, progress: 0, revenue: 0 });
  const [toursInProgress, setToursInProgress] = useState([]);
  const [revenueTable, setRevenueTable] = useState([]);
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  useEffect(() => {
    socket.on('analytics:update', (data) => {
      setSummary(data.summary);
      //setToursInProgress(data.progressTable );
      setToursInProgress(data.progressTable);
      setRevenueTable(data.revenueTable);
      updateCharts(data.lineData, data.pieData);
    });

    return () => {
      socket.off('analytics:update');
    };
  }, []);

  const updateCharts = (lineData, pieData) => {
  const lineCtx = lineChartRef.current?.getContext('2d');
  const pieCtx = pieChartRef.current?.getContext('2d');

  // === LINE CHART ===
  if (lineChartInstance.current) {
    lineChartInstance.current.data.labels = Object.keys(lineData).sort();
    lineChartInstance.current.data.datasets[0].data = Object.values(lineData);
    lineChartInstance.current.update();
  } else if (lineCtx) {
    lineChartInstance.current = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: Object.keys(lineData).sort(),
        datasets: [{
          label: 'Bookings',
          data: Object.values(lineData),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 800,      // durasi animasi (ms)
          easing: 'easeOutQuart' // gaya animasi
        }
      }
    });
  }

  // === PIE CHART ===
  if (pieChartInstance.current) {
    pieChartInstance.current.data.labels = Object.keys(pieData);
    pieChartInstance.current.data.datasets[0].data = Object.values(pieData);
    pieChartInstance.current.update();
  } else if (pieCtx) {
    pieChartInstance.current = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(pieData),
        datasets: [{
          data: Object.values(pieData),
          backgroundColor: Object.keys(pieData).map(
            () => `hsl(${Math.random() * 360}, 70%, 60%)`
          )
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 800,
          easing: 'easeOutBounce' // biar lebih “fun”
        }
      }
    });
  }
};


  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">📊 Live Tour Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4 text-center">
          <h3 className="font-bold">Total Bookings</h3>
          <p className="text-2xl">{summary.bookings}</p>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <h3 className="font-bold">In Progress</h3>
          <p className="text-2xl">{summary.progress}</p>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <h3 className="font-bold">Revenue</h3>
          <p className="text-2xl">USD {summary.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-bold mb-2">📈 Bookings Over Time</h3>
          <canvas ref={lineChartRef}></canvas>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-bold mb-2">📍 Bookings by Destination</h3>
          <canvas ref={pieChartRef}></canvas>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-bold mb-2">🚧 Tours In Progress</h3>
          <table className="w-full text-sm">
            <thead><tr><th className="text-left">Guide</th><th className="text-left">Destination</th></tr></thead>
            <tbody>
              {toursInProgress.map((t, i) => (
                <tr key={i}><td>{t.guide}</td><td>{t.dest}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-bold mb-2">💰 Revenue by Destination</h3>
          <table className="w-full text-sm">
            <thead><tr><th className="text-left">Destination</th><th className="text-left">Revenue</th></tr></thead>
            <tbody>
              {revenueTable.map((row, i) => (
                <tr key={i}><td>{row.dest}</td><td>USD {row.rev.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
