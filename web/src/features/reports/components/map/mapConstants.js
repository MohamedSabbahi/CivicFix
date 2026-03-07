// Map constants - single source of truth for map configuration
import L from 'leaflet';
import { statusConfig } from '../report/reportConstants';

// Default map center (NYC)
export const DEFAULT_CENTER = [40.7128, -74.0060];
export const DEFAULT_ZOOM = 13;
export const DEFAULT_RADIUS = 5;

// Status colors for map markers (derived from reportConstants)
export const statusColors = {
  NEW: '#3B82F6',
  IN_PROGRESS: '#EAB308',
  RESOLVED: '#22C55E',
};

// Get status color for markers
export const getStatusColor = (status) => {
  return statusColors[status] || statusColors.NEW;
};

// Create custom marker icon based on report status
export const createMarkerIcon = (status) => {
  const config = statusConfig[status] || statusConfig.NEW;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${config.color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          font-weight: bold;
        "></span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// User location marker icon
export const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #8B5CF6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.3), 0 4px 12px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Default marker icon (for fallback)
export const defaultMarkerIcon = createMarkerIcon('NEW');

export default {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  DEFAULT_RADIUS,
  statusColors,
  createMarkerIcon,
  createUserLocationIcon,
};

