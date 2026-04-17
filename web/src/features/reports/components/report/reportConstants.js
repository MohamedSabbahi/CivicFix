export const statusColors = {
  NEW: '#06B6D4',      
  IN_PROGRESS: '#F97316', 
  RESOLVED: '#22C55E',  
};

export const statusConfig = {
  PENDING: { 
    color: statusColors.NEW, 
    label: 'New', 
    bg: 'bg-cyan-500', 
    dot: 'bg-cyan-400',
    text: 'text-cyan-400'
  },
  
  IN_PROGRESS: { 
    color: statusColors.IN_PROGRESS, 
    label: 'In Progress', 
    bg: 'bg-orange-500', 
    dot: 'bg-orange-400',
    text: 'text-orange-400'
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