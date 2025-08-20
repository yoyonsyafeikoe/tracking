import { useState } from 'react';
import AddJobForm from './components/AddJobForm';
import ManageUsers from './components/ManageUsers';
import MonitoringPage from './MonitoringPage';
import Analytics from './Analytics';
import TrackingHistory from './TrackingHistory'; // ✅ gunakan file yang sudah kamu punya

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('add-job');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'add-job':
        return <AddJobForm />;
      case 'tracking-history':
        return <TrackingHistory />;
      case 'manage-users':
        return <ManageUsers />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'analytics':
        return <Analytics />;
      default:
        return <AddJobForm />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 font-bold text-xl border-b">
            Admin Panel
          </div>
          <nav className="flex-1 px-4 py-6 space-y-4 text-gray-700">
            <button
              onClick={() => setActiveView('add-job')}
              className={`w-full text-left ${
                activeView === 'add-job' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              ➕ Add Job
            </button>
            <button
              onClick={() => setActiveView('tracking-history')}
              className={`w-full text-left ${
                activeView === 'tracking-history'
                  ? 'text-blue-600 font-semibold'
                  : ''
              }`}
            >
              📍 Tracking History
            </button>
            <button
              onClick={() => setActiveView('manage-users')}
              className={`w-full text-left ${
                activeView === 'manage-users'
                  ? 'text-blue-600 font-semibold'
                  : ''
              }`}
            >
              👥 Manage Users
            </button>
            <button
              onClick={() => setActiveView('monitoring')}
              className={`w-full text-left ${
                activeView === 'monitoring'
                  ? 'text-blue-600 font-semibold'
                  : ''
              }`}
            >
              🗺️ Monitoring
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`w-full text-left ${
                activeView === 'analytics'
                  ? 'text-blue-600 font-semibold'
                  : ''
              }`}
            >
              📊 Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between bg-white shadow px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 text-xl"
          >
            ☰
          </button>
          <h1 className="font-semibold text-lg">Admin Dashboard</h1>
        </header>

        {/* View content */}
        <main className="flex-1 p-6 bg-gray-100">{renderView()}</main>
      </div>
    </div>
  );
}
