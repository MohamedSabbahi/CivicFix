// MapMarker - Single marker component with popup
import { Marker, Popup } from 'react-leaflet';
import { createMarkerIcon } from './mapConstants';
import { statusConfig } from '../report/reportConstants';

const MapMarker = ({ report, onClick }) => {
  const status = statusConfig[report.status] || statusConfig.NEW;
  
  return (
    <Marker
      position={[report.latitude, report.longitude]}
      icon={createMarkerIcon(report.status)}
      eventHandlers={{
        click: () => onClick && onClick(report),
      }}
    >
      <Popup>
        <div className="min-w-[220px] p-2">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{report.title}</h3>
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">{report.description}</p>
          <div className="flex items-center justify-between mb-1">
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${status.color}20`,
                color: status.color
              }}
            >
              {status.label}
            </span>
            <span className="text-gray-400 text-xs">
              {report.category?.name || 'Uncategorized'}
            </span> 
          </div>
          <p className="text-gray-400 text-[10px]">
            {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

export default MapMarker;

