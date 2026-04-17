import React from 'react';
import Avatar from './Avatar';
import { Award, Edit2, Calendar, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileHeader = ({ isEditing, onEditToggle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
className="bg-transparent border border-white/10 rounded-2xl p-8 backdrop-blur-none hover:bg-transparent transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between flex-wrap gap-6"
  >
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between flex-wrap gap-6">
      <div className="flex items-start gap-6 flex-1 min-w-0">
        <Avatar name="John Doe" />
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">John Doe</h1>
          <div className="flex items-center gap-3 mb-4">
            <Award size={18} className="text-blue-400 flex-shrink-0" />
            <span className="px-4 py-1.5 rounded-full text-sm bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
              Citizen
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <Mail size={16} />
              john.doe@example.com
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Calendar size={16} />
              Joined Jan 15, 2021
            </div>
          </div>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEditToggle}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-medium text-sm transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 whitespace-nowrap ml-auto"
      >
        <Edit2 size={16} />
        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
      </motion.button>
    </div>
  </motion.div>
);

export default ProfileHeader;

