import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import PrivateRoute from './features/auth/components/PrivateRoute';
import Profile from './features/auth/pages/Profile';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import HomePage from "./features/home/pages/HomePage";
// Placeholder components 
const Admin = () => <div className="p-8"><h1>Admin Dashboard</h1></div>;
const Reports = () => <div className="p-8"><h1>Reports List</h1></div>;
const ReportDetail = () => <div className="p-8"><h1>Report Details</h1></div>;
const CreateReport = () => <div className="p-8"><h1>Create New Report</h1></div>;
const NotFound = () => <div className="p-8 text-red-500"><h1>404 - Page Not Found</h1></div>;



function App() {
  return (
    <BrowserRouter>
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
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/create-report" element={<CreateReport />} />
        </Route>
        
        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;