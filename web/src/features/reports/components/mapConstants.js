// Map status colors configuration
export const statusColors = {
  NEW: '#3B82F6',        // Blue
  IN_PROGRESS: '#EAB308', // Yellow
  RESOLVED: '#22C55E',    // Green
};

// Map status configuration with labels
export const statusConfig = {
  NEW: { color: statusColors.NEW, label: 'New', dot: 'bg-blue-400' },
  IN_PROGRESS: { color: statusColors.IN_PROGRESS, label: 'In Progress', dot: 'bg-yellow-400' },
  RESOLVED: { color: statusColors.RESOLVED, label: 'Resolved', dot: 'bg-green-400' },
};

