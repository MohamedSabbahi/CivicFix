// Report status configuration - single source of truth for all status-related styling
// Status colors for maps and UI elements
export const statusColors = {
  NEW: '#3B82F6',        // Blue
  IN_PROGRESS: '#EAB308', // Yellow
  RESOLVED: '#22C55E',    // Green
};

// Complete status configuration with labels, colors, and CSS classes
export const statusConfig = {
  NEW: { 
    color: statusColors.NEW, 
    label: 'New', 
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

// Get status config by status key, with fallback to NEW
export const getStatusConfig = (status) => {
  return statusConfig[status] || statusConfig.NEW;
};

// Export default for convenience
export default statusConfig;

