import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AdminDashboard from '../pages/AdminDashboard';
import DriverDashboard from '../pages/DriverDashboard';
import GuideDashboard from '../pages/GuideDashboard';
import ManageUsers from '../pages/components/ManageUsers';
import MonitoringPage from '../pages/MonitoringPage';
import Analytics from '../pages/Analytics';
import TrackingHistory from "../pages/TrackingHistory";
import TrackingHistoryDetail from "../pages/TrackingHistoryDetail";
import TourPackageIndex from "../pages/components/TourPackageIndex";
import ViewRoute from "../pages/ViewRoute";



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/driver" element={<DriverDashboard />} />
      <Route path="/guide" element={<GuideDashboard />} />
	    <Route path="/admin/manage-users" element={<ManageUsers />} />
      <Route path="/admin/monitoring" element={<MonitoringPage />} />
      <Route path="/admin/analytics" element={<Analytics />} />
      <Route path="/tracking-history" element={<TrackingHistory />} />
      <Route path="/tracking/:sessionId" element={<TrackingHistoryDetail />} />
      <Route path="/tracking/:id" element={<ViewRoute />} />
      <Route path="/tour-packages" element={<TourPackageIndex />} />
    </Routes>
  );
}