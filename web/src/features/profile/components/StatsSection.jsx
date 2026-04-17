import React from 'react';
import { motion } from 'framer-motion';
import StatCard from './StatCard';
import { BarChart3, Award, Clock } from 'lucide-react';

const StatsSection = () => (
  <motion.section 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
      <BarChart3 size={24} className="text-blue-400" />
      Account Stats
    </h2>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        icon={BarChart3}
        label="Total Reports"
        value="32"
      />
      <StatCard 
        icon={Award}
        label="Resolved"
        value="24"
        className="border-green-500/30 [&>div]:bg-gradient-to-br [&>div]:from-emerald-500/20 [&>div]:to-teal-500/20 [&>div]:border-emerald-500/30"
      />
      <StatCard 
        icon={Clock}
        label="Pending"
        value="8"
        className="border-yellow-500/30 [&>div]:bg-gradient-to-br [&>div]:from-orange-500/20 [&>div]:to-amber-500/20 [&>div]:border-orange-500/30"
      />
    </div>
  </motion.section>
);

export default StatsSection;

