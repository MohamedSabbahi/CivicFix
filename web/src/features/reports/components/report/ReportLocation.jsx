// ReportLocation - Location/map picker component for create report form
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Map, Navigation, AlertCircle } from "lucide-react";

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to center map on location (placeholder for future use)
const MapCenterHandler = () => null;

const ReportLocation = ({ 
  formData, 
  errors, 
  showMap, 
  onToggleMap, 
  onGetCurrentLocation, 
  onLocationSelect,
  geoLoading 
}) => {
  // Default center
  const defaultCenter = formData.latitude && formData.longitude 
    ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] 
    : [40.7128, -74.0060];

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-white/70">
          Location <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onGetCurrentLocation}
            disabled={geoLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition disabled:opacity-50"
          >
            <Navigation size={14} />
            {geoLoading ? 'Getting...' : 'Current'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-white/40 mb-1">Latitude</label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            placeholder="e.g., 40.7128"
            className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border ${
              errors.latitude ? "border-red-400/50" : "border-white/10"
            } text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50`}
          />
          {errors.latitude && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.latitude}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Longitude</label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            placeholder="e.g., -74.0060"
            className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border ${
              errors.longitude ? "border-red-400/50" : "border-white/10"
            } text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50`}
          />
          {errors.longitude && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.longitude}
            </p>
          )}
        </div>
      </div>

      {/* Interactive Map */}
      <div className="mt-4">
        <button
          type="button"
          onClick={onToggleMap}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-sm font-medium transition mb-3"
        >
          <Map size={16} />
          {showMap ? "Hide Map" : "Select from Map"}
        </button>
        
        {showMap && (
          <div className="rounded-xl overflow-hidden border border-white/10 h-64">
            <MapContainer
              center={defaultCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {formData.latitude && formData.longitude && (
                <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
              )}
              <MapClickHandler onLocationSelect={onLocationSelect} />
            </MapContainer>
          </div>
        )}
        {showMap && (
          <p className="text-xs text-white/40 mt-2">
            Click on the map to select a location, or use the "Current" button to get your GPS coordinates.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReportLocation;

