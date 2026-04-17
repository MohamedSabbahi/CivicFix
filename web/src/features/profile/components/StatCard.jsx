import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, className = '' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ y: -4 }}
    className={`
      bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 
      backdrop-blur-xl hover:bg-white/[0.07] transition-all duration-300
      ${className}
    `}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
        <Icon size={20} className="text-blue-300 drop-shadow-sm" />
      </div>
      <span className="text-white/60 text-sm font-medium uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-3xl font-bold text-white drop-shadow-lg">{value}</div>
  </motion.div>
);

export default StatCard;

