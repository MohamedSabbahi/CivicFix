import { User, Truck, Check } from 'lucide-react';

export const REPORT_STATUS = ({
  NEW:         'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED:    'RESOLVED',
});

export const TRACKING_STEPS = [
  { key: REPORT_STATUS.NEW,         label: 'Pending',     icon: User,  color: '#f97316' },
  { key: REPORT_STATUS.IN_PROGRESS, label: 'In Progress', icon: Truck, color: '#3b82f6' },
  { key: REPORT_STATUS.RESOLVED,    label: 'Resolved',    icon: Check, color: '#22c55e' },
];

export const getStepIndex = (status = '') => {
  const normalised = status.toUpperCase().replace(/\s+/g, '_');
  const index = TRACKING_STEPS.findIndex((s) => s.key === normalised);
  return index >= 0 ? index : 0;
};