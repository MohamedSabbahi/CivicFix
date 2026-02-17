import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
/**
 * ???????????????????????????
 */
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Placeholder components 
const Home = () => <div className="p-8 text-2xl font-bold">Dashboard / Home (Protected)</div>;
const Profile = () => <div className="p-8"><h1>My Profile</h1></div>;
const Admin = () => <div className="p-8"><h1>Admin Dashboard</h1></div>;
const Reports = () => <div className="p-8"><h1>Reports List</h1></div>;
const ReportDetail = () => <div className="p-8"><h1>Report Details</h1></div>;
const CreateReport = () => <div className="p-8"><h1>Create New Report</h1></div>;
const NotFound = () => <div className="p-8 text-red-500"><h1>404 - Page Not Found</h1></div>;



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes: Wrapped in PrivateRoute */}
        <Route 
          path="/" 
          element={<PrivateRoute><Home /></PrivateRoute>} 
        />
        <Route 
          path="/profile" 
          element={<PrivateRoute><Profile /></PrivateRoute>} 
        />
        <Route 
          path="/admin" 
          element={<PrivateRoute><Admin /></PrivateRoute>} 
        />
        <Route 
          path="/reports" 
          element={<PrivateRoute><Reports /></PrivateRoute>} 
        />
        <Route 
          path="/reports/:id" 
          element={<PrivateRoute><ReportDetail /></PrivateRoute>} 
        />
        <Route 
          path="/create-report" 
          element={<PrivateRoute><CreateReport /></PrivateRoute>} 
        />
        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;