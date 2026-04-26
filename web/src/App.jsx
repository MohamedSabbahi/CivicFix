import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';


import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import PrivateRoute from './features/auth/components/PrivateRoute';
import AdminRoute from './features/auth/components/AdminRoute';
import Profile from './features/profile/pages/Profile';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import Dashboard from "./features/home/pages/Dashboard";
import Reports from './features/reports/pages/Report';
import MyReports from './features/reports/pages/MyReports';
import ReportDetails from './features/reports/pages/ReportDetails';
import CreateReport from './features/reports/pages/CreateReport';
import MapPage from './features/reports/pages/MapPage';
import Admin from './features/admin/pages/AdminDashboard';
// ✅ Admin — tous les imports nécessaires
import AdminLayout    from './features/admin/layouts/AdminLayout';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminReportDetail from './features/admin/pages/ReportDetail';
import Analytics      from './features/admin/pages/Analytics';
import Departments    from './features/admin/pages/Departments';
import AdminProfile from './features/admin/pages/ADMprofile';
// Placeholder components 
const Settings = () => <div className="p-8"><h1>Settings</h1></div>;
const ReportDetail = () => <div className="p-8"><h1>Report Details</h1></div>;
const NotFound = () => <div className="p-8 text-red-500"><h1>404 - Page Not Found</h1></div>;

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/settings"      element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route path="/create-report" element={<CreateReport />} />
        </Route>
        {/*Admin Routes*/}
      <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="analytics"   element={<Analytics />} />
                <Route path="reports/:id" element={<AdminReportDetail />} />
                <Route path="Departments" element={<Departments />} />
                <Route path="admprofile"    element={<AdminProfile />} />
            </Route>
    </Route>
        
        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      </>
  );
}

export default App;