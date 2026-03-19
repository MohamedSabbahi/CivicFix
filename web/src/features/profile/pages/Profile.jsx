import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import profileService from '../services/profileService';
import Sidebar from '../../home/components/Sidebar';
import background from '../../../assets/background-dashbord.png';
import { Edit2, User, Mail, Calendar, BarChart3, Award, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PageShell = ({ children }) => (
  <div className="relative min-h-screen text-white">
    <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
    <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
    <div className="fixed top-0 left-1/2 w-96 h-96 -translate-x-1/2 bg-blue-500/20 blur-[150px] -translate-y-1/2 rounded-full" />
    <div className="fixed inset-0 bg-[#020617]/60" />
    <div className="relative z-10 flex">
      <Sidebar />
      <main className="flex-1 min-w-0 ml-[260px] p-8 lg:ml-[260px]">{children}</main>
    </div>
  </div>
);

const InfoField = ({ icon: Icon, label, value, isEditing, onChange, disabled = false, name = '' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-2 mb-6 last:mb-0"
  >
    <div className="flex items-center gap-3 text-white/60">
      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-blue-400" />
      </div>
      <span className="text-xs uppercase tracking-wide font-medium">{label}</span>
    </div>
    {isEditing ? (
      <input 
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl text-lg backdrop-blur-sm transition-all ${
          disabled
            ? 'bg-white/5 border-white/10 text-white/70 cursor-not-allowed'
            : 'bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 hover:border-white/30'
        }`}
        placeholder={disabled ? '' : `Enter ${label.toLowerCase()}`}
      />
    ) : (
      <div className="text-sm text-white">{value}</div>
    )}
  </motion.div>
);

const StatCard = ({ label, value }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/[0.02] rounded-2xl p-6 lg:p-7 border border-white/[0.08] w-full"
  >
    <h3 className="text-lg font-semibold text-white mb-4">Account Stats</h3>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
        <BarChart3 size={16} className="text-blue-400" />
      </div>
      <div>
        <dt className="text-xs text-white/40 uppercase tracking-wide font-medium">Total Reports</dt>
        <dd className="text-sm text-white font-semibold">{value}</dd>
      </div>
    </div>
  </motion.div>
);

const ProfileCard = ({ user, isEditing, onEditToggle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.07] transition-all duration-300 backdrop-blur-xl"
  >
    <div className="flex items-start gap-6">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl flex-shrink-0 mt-1">
        <User size={36} className="text-blue-200" />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-white mb-1">{user?.name || 'Loading...'}</h1>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-blue-400" />
              <span className="text-sm text-blue-300 font-medium bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                {user?.role || 'Citizen'}
              </span>
            </div>
          </div>
          <button
            onClick={onEditToggle}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 whitespace-nowrap ml-4 flex-shrink-0"
          >
            <Edit2 size={18} />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [totalReports, setTotalReports] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const { user, updateUser } = useAuth();

  useEffect(() => {
    const fetchReportsCount = async () => {
      try {
        setLoadingStats(true);
        const count = await profileService.getMyReportsCount();
        setTotalReports(count);
      } catch (error) {
        console.error('Failed to fetch reports count:', error);
        setTotalReports(0);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchReportsCount();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedData = {};
      if (formData.name !== user.name) updatedData.name = formData.name;

      if (Object.keys(updatedData).length > 0) {
        const response = await profileService.updateProfile(updatedData);
        updateUser(response);
        toast.success('Profile updated successfully! ✅');
      } else {
        toast('No changes detected');
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Update failed. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    toast('Changes cancelled');
  };

  if (!user) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white/80">Please log in to view your profile</p>
        </div>
      </PageShell>
    );
  }

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }) : 'Unknown';

  return (
    <PageShell>
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 max-w-6xl mx-auto"
      >
        <ProfileCard 
          user={user} 
          isEditing={isEditing} 
          onEditToggle={handleEditToggle} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`space-y-1 rounded-2xl p-8 transition-all duration-300 ${isEditing ? 'bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl' : 'bg-transparent border-transparent backdrop-blur-none'}`}
          >
<h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <User size={24} />
              Personal Information
            </h2>
            
            <InfoField 
              icon={User}
              label="Full Name"
              value={formData.name}
              isEditing={isEditing}
              onChange={handleInputChange}
              name="name"
            />
            
            <InfoField 
              icon={Mail}
              label="Email"
              value={formData.email}
              isEditing={isEditing}
              onChange={handleInputChange}
              name="email"
              disabled={true}
            />

            <InfoField 
              icon={Calendar}
              label="Member since"
              value={memberSince}
              isEditing={false}
            />
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 size={24} />
              Account Stats
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <StatCard 
                label="Total Reports"
                value={loadingStats ? 'Loading...' : totalReports}
              />
            </div>
          </motion.section>
        </div>

        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 justify-end bg-transparent border-transparent rounded-2xl p-6 backdrop-blur-none"
          >
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 font-medium rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
            >
              <Save size={18} />
              Save Changes
            </button>
          </motion.div>
        )}
      </motion.main>
    </PageShell>
  );
};

export default Profile;
