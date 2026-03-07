import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { statusConfig, statusColors } from './mapConstants';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to center map on user location
const MapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Reports Map Component
const ReportsMap = ({ 
  reports = [], 
  center = [40.7128, -74.0060], // Default: NYC
  zoom = 13,
  onMarkerClick,
  showRadius = false,
  radius = 5,
  // eslint-disable-next-line no-unused-vars
  onMapMove,
}) => {
  const mapRef = useRef(null);

  const getStatusColor = (status) => {
    return statusColors[status] || statusColors.NEW;
  };

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-xl"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Show radius circle if enabled */}
      {showRadius && (
        <Circle
          center={center}
          radius={radius * 1000}
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 10',
          }}
        />
      )}

      {/* Report markers */}
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={createCustomIcon(getStatusColor(report.status))}
          eventHandlers={{
            click: () => onMarkerClick && onMarkerClick(report),
          }}
        >
          <Popup>
            <div className="min-w-[200px] p-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{report.title}</h3>
              <p className="text-gray-600 text-xs mb-2 line-clamp-2">{report.description}</p>
              <div className="flex items-center justify-between">
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${getStatusColor(report.status)}20`,
                    color: getStatusColor(report.status)
                  }}
                >
                  {statusConfig[report.status]?.label || 'New'}
                </span>
                <span className="text-gray-400 text-xs">
                  {report.category?.name || 'Uncategorized'}
                </span>
              </div>
              {report.distance && (
                <p className="text-gray-500 text-xs mt-1">
                  {report.distance.toFixed(1)} km away
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ReportsMap;

