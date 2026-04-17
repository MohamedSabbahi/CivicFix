export const statusColors = {
  NEW: '#3B82F6',     
  IN_PROGRESS: '#EAB308',
  RESOLVED: '#22C55E',  
};

export const statusConfig = {
  PENDING: { 
    color: statusColors.NEW, 
  label: 'PENDING ', 
    bg: 'bg-blue-500', 
    dot: 'bg-blue-400',
    text: 'text-blue-400'
  },
  
  IN_PROGRESS: { 
    color: statusColors.IN_PROGRESS, 
    label: 'In Progress', 
    bg: 'bg-yellow-500', 
    dot: 'bg-yellow-400',
    text: 'text-yellow-400'
  },
  RESOLVED: { 
    color: statusColors.RESOLVED, 
    label: 'Resolved', 
    bg: 'bg-green-500', 
    dot: 'bg-green-400',
    text: 'text-green-400'
  },
};

export const getStatusConfig = (status) => {
  return statusConfig[status] || statusConfig.PENDING;
};

export default statusConfig;