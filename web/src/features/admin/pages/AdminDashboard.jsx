import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome, Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

