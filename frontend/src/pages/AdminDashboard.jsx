import { useState } from 'react';
import TourJobPage from './components/TourJobPage';
import ManageUsers from './components/ManageUsers';
import MonitoringPage from './MonitoringPage';
import Analytics from './Analytics';
import TrackingHistory from './TrackingHistory'; 
import TourPackageList from './components/TourPackageList';
import TourPackagePage from "./components/TourPackagePage.jsx";
import TourPackageIndex from "./components/TourPackageIndex.jsx";
import HotelPage from "./components/HotelPage.jsx";
import HotelList from "./components/HotelList.jsx";
import HotelIndex from './components/HotelIndex.jsx';
import TourJobIndex from "./components/TourJobIndex.jsx";

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("manage-users");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);
  const [tourPackageView, setTourPackageView] = useState("list");

  // 🔹 khusus hotel
  const [hotelView, setHotelView] = useState("list");
  const [editingHotel, setEditingHotel] = useState(null);

  const renderView = () => {
    switch (activeView) {
      case "hotels":
        // ✅ Edit hotel
        if (editingHotel) {
          return (
            <HotelPage
              onBack={() => {
                setHotelView("list");
                setEditingHotel(null);
              }}
              initialData={editingHotel}
            />
          );
        }

        // ✅ Add hotel
        if (hotelView === "add") {
          return <HotelPage onBack={() => setHotelView("list")} />;
        }

        // ✅ Default list hotel
        return (
          <HotelList
            onAdd={() => setHotelView("add")}
            onEdit={(hotel) => setEditingHotel(hotel)}
          />
        );

      case "tour-packages":
        return <TourPackageIndex />;
      case "add-job":
        return <TourJobIndex />;
      case "tracking-history":
        return <TrackingHistory />;
      case "manage-users":
        return <ManageUsers />;
      case "monitoring":
        return <MonitoringPage />;
      case "analytics":
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
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 font-bold text-xl border-b">
            Admin Panel
          </div>
          <nav className="flex-1 px-4 py-6 space-y-4 text-gray-700">
            {/* Master Data */}
            <div
              className="relative group"
              onMouseEnter={() => setMasterOpen(true)}
              onMouseLeave={() => setMasterOpen(false)}
            >
              <button
                className={`w-full text-left flex justify-between items-center ${
                  activeView === "tour-packages" || activeView === "hotels"
                    ? "text-blue-600 font-semibold"
                    : ""
                }`}
              >
                📂 Master Data
                <span>{masterOpen ? "▲" : "▼"}</span>
              </button>

              {masterOpen && (
                <div className="ml-6 mt-2 space-y-2">
                  <button
                    onClick={() => {
                      setActiveView("hotels");
                      setHotelView("list");
                      setEditingHotel(null);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    🏨 Hotels
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("tour-packages");
                      setTourPackageView("list");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    🏝️ Tour Package
                  </button>
                </div>
              )}
            </div>

            {/* Menu lain */}
            <button
              onClick={() => setActiveView("manage-users")}
              className={`w-full text-left ${
                activeView === "manage-users" ? "text-blue-600 font-semibold" : ""
              }`}
            >
              👥 Manage Users
            </button>
            <button
              onClick={() => setActiveView("add-job")}
              className={`w-full text-left ${
                activeView === "add-job" ? "text-blue-600 font-semibold" : ""
              }`}
            >
              ➕ Tour Job
            </button>
            <button
              onClick={() => setActiveView("monitoring")}
              className={`w-full text-left ${
                activeView === "monitoring" ? "text-blue-600 font-semibold" : ""
              }`}
            >
              🗺️ Monitoring
            </button>
            <button
              onClick={() => setActiveView("tracking-history")}
              className={`w-full text-left ${
                activeView === "tracking-history"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
            >
              📍 Tracking History
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className={`w-full text-left ${
                activeView === "analytics" ? "text-blue-600 font-semibold" : ""
              }`}
            >
              📊 Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-white shadow px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 text-xl"
          >
            ☰
          </button>
          <h1 className="font-semibold text-lg">Admin Dashboard</h1>
        </header>
        <main className="flex-1 p-6 bg-gray-100">{renderView()}</main>
      </div>
    </div>
  );
}
