import React from 'react';

const Avatar = ({ name = 'JD', size = '72px', className = '' }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const colors = [
    'from-blue-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
  ];

  const colorIndex = initials.charCodeAt(0) % colors.length;

  return (
    <div 
      className={`
        w-[${size}] h-[${size}] rounded-full flex items-center justify-center 
        bg-gradient-to-br ${colors[colorIndex]} border-4 border-white/20
        shadow-2xl backdrop-blur-sm ${className}
      `}
      style={{ width: size, height: size }}
    >
      <span className="text-2xl font-bold text-white drop-shadow-lg">
        {initials}
      </span>
    </div>
  );
};

export default Avatar;

