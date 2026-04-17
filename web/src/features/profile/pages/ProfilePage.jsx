import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../home/components/Sidebar';
import background from '../../../assets/background-dashbord.png';
import ProfileHeader from '../components/ProfileHeader';
import ProfileForm from '../components/ProfileForm';
import StatsSection from '../components/StatsSection';

const PageShell = ({ children }) => (
  <div className="relative min-h-screen text-white overflow-hidden">
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: `url(${background})` }}
    />
    
    {/* Dark Tint Overlay */}
    <div className="absolute inset-0 bg-[#020617]/60" />
    
    {/* Vignette Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent/50 to-black/50" />
    
    {/* Ambient Blue Glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-500/20 blur-[150px] -translate-y-1/2" />
    
    <div className="relative z-10 flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 ml-[260px] lg:ml-[260px] p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
          {children}
        </div>
      </main>
    </div>
  </div>
);

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    console.log('Saving profile...');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <PageShell>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2
            }
          }
        }}
      >
        <ProfileHeader 
          isEditing={isEditing} 
          onEditToggle={handleEditToggle}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProfileForm 
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
          />
          
          <StatsSection />
        </div>
      </motion.div>
    </PageShell>
  );
};

export default ProfilePage;

