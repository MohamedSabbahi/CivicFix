import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const InfoField = React.memo(({ icon: Icon, label, name, value, isEditing, onChange }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-3 mb-8 last:mb-0"
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-white/60 flex-shrink-0" />
      <span className="font-medium text-white/60 text-sm uppercase tracking-wide">{label}</span>
    </div>
    {isEditing ? (
      <input 
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-5 py-4 bg-white/[0.05] border border-white/[0.1] rounded-xl text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    ) : (
      <div className="px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xl font-semibold text-white backdrop-blur-sm hover:bg-white/[0.05] transition-all cursor-default">
        {value}
      </div>
    )}
  </motion.div>
));

const ProfileForm = ({ isEditing, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    city: 'New York, NY'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.section 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
    >
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <User size={24} className="text-blue-400" />
        Personal Information
      </h2>
      
      <InfoField 
        icon={User}
        label="Full Name"
        name="name"
        value={formData.name}
        isEditing={isEditing}
        onChange={handleInputChange}
      />
      
      <InfoField 
        icon={Mail}
        label="Email"
        name="email"
        value={formData.email}
        isEditing={isEditing}
        onChange={handleInputChange}
      />
      
      <InfoField 
        icon={Phone}
        label="Phone"
        name="phone"
        value={formData.phone}
        isEditing={isEditing}
        onChange={handleInputChange}
      />
      
      <InfoField 
        icon={MapPin}
        label="City"
        name="city"
        value={formData.city}
        isEditing={isEditing}
        onChange={handleInputChange}
      />

      {isEditing && (
        <div className="flex gap-4 pt-6 border-t border-white/[0.1] mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            className="flex-1 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
          >
            Save Changes
          </motion.button>
        </div>
      )}
    </motion.section>
  );
};

export default ProfileForm;


