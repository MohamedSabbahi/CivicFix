import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../home/components/Sidebar';
import background from '../../../assets/background-dashbord.png';
import { Edit2, User, Mail, Phone, MapPin, Calendar, Award, BarChart3 } from 'lucide-react';

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

const ProfileCard = ({ isEditing, onEdit }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.07] transition-all duration-300 backdrop-blur-xl"
  >
    <div className="flex items-center gap-6 mb-8">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl">
        <User size={36} className="text-blue-200" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-white mb-1">John Doe</h1>
        <div className="flex items-center gap-2 mb-2">
          <Award size={16} className="text-blue-400" />
          <span className="text-sm text-blue-300 font-medium bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">Citizen</span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-sm font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
        >
          <Edit2 size={16} />
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Mail size={18} className="text-white/60" />
          <span className="text-white/60 font-medium">Email</span>
        </div>
        {isEditing ? (
          <input 
            type="email" 
            defaultValue="john.doe@example.com"
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        ) : (
          <div className="text-white font-medium text-lg">john.doe@example.com</div>
        )}
      </div>
      
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Calendar size={18} className="text-white/60" />
          <span className="text-white/60 font-medium">Member since</span>
        </div>
        <div className="text-white/80 font-medium">January 15, 2021</div>
      </div>
    </div>
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value, className = '' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.07] transition-all duration-300 backdrop-blur-xl ${className}`}
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
        <Icon size={20} className="text-blue-300" />
      </div>
      <div className="text-white/60 text-sm font-medium">{label}</div>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </motion.div>
);

const InfoField = ({ icon: Icon, label, value, isEditing, onChange }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-2 mb-6 last:mb-0"
  >
    <div className="flex items-center gap-3 text-white/60">
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </div>
    {isEditing ? (
      <input 
        type="text" 
        defaultValue={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg"
      />
    ) : (
      <div className="text-xl font-semibold text-white">{value}</div>
    )}
  </motion.div>
);

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const profileData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    city: 'New York, NY',
    stats: {
      total: '12',
      resolved: '8',
      pending: '4'
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <PageShell>
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 max-w-6xl mx-auto"
      >
        <ProfileCard isEditing={isEditing} onEdit={handleEditToggle} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Info */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <User size={24} />
              Personal Information
            </h2>
            
            <InfoField 
              icon={User}
              label="Full Name" 
              value={profileData.name}
              isEditing={isEditing}
              onChange={() => {}}
            />
            
            <InfoField 
              icon={Mail}
              label="Email" 
              value={profileData.email}
              isEditing={isEditing}
              onChange={() => {}}
            />
            
            <InfoField 
              icon={Phone}
              label="Phone" 
              value={profileData.phone}
              isEditing={isEditing}
              onChange={() => {}}
            />
            
            <InfoField 
              icon={MapPin}
              label="City" 
              value={profileData.city}
              isEditing={isEditing}
              onChange={() => {}}
            />
          </motion.section>

          {/* Stats */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 size={24} />
              Account Stats
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard 
                icon={BarChart3}
                label="Total Reports"
                value={profileData.stats.total}
              />
              <StatCard 
                icon={Award}
                label="Resolved"
                value={profileData.stats.resolved}
                className="border-green-500/30"
              />
              <StatCard 
                icon={BarChart3}
                label="Pending"
                value={profileData.stats.pending}
                className="border-yellow-500/30"
              />
            </div>
          </motion.section>
        </div>

        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 justify-end bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl"
          >
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white/80 font-medium rounded-xl transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
            >
              Save Changes
            </button>
          </motion.div>
        )}
      </motion.main>
    </PageShell>
  );
};

export default Profile;