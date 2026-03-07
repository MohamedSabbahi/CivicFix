// MapContainer - Leaflet map component with markers and radius circle
import { useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Circle, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapController from './MapController';
import MapMarker from './MapMarker';
import { DEFAULT_CENTER, DEFAULT_ZOOM, createUserLocationIcon } from './mapConstants';

// Fix Leaflet default marker icons for React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapContainerComponent = ({ 
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  reports = [],
  userLocation = null,
  showRadius = false,
  radius = 5,
  onMarkerClick,
  loading = false,
  showZoomControl = true,
}) => {
  const mapRef = useRef(null);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 h-full">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] bg-black/50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <LeafletMapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {showZoomControl && <ZoomControl position="bottomright" />}
        <MapController center={center} zoom={zoom} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationIcon()}>
            <Popup>Your Location</Popup>
          </Marker>   
        )}
        
        {/* Radius circle */}
        {userLocation && showRadius && (
          <Circle
            center={userLocation}
            radius={radius * 1000}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '8, 8',
            }}
          />
        )}
        
        {/* Report markers */}
        {reports.map((report) => (
          <MapMarker
            key={report.id}
            report={report}
            onClick={onMarkerClick}
          />
        ))}
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainerComponent;

