import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import PrivateRoute from './features/auth/components/PrivateRoute';
import Profile from './features/auth/pages/Profile';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import Dashboard from "./features/home/pages/Dashboard";
import Reports from './features/reports/pages/Report';
import ReportDetails from './features/reports/pages/ReportDetails';
import CreateReport from './features/reports/pages/CreateReport';
import MapPage from './features/reports/pages/MapPage';
// Placeholder components 
const Admin = () => <div className="p-8"><h1>Admin Dashboard</h1></div>;
const ReportDetail = () => <div className="p-8"><h1>Report Details</h1></div>;
const NotFound = () => <div className="p-8 text-red-500"><h1>404 - Page Not Found</h1></div>;
const Notifications = () => <div className="p-8"><h1>Notifications</h1></div>; 
const Settings    = () => <div className="p-8"><h1>Settings</h1></div>;


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
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings"      element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route path="/create-report" element={<CreateReport />} />
        </Route>
        
        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      </>
  );
}

export default App;