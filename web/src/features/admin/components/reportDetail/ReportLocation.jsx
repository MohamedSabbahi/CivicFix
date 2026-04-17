import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ReportLocation = ({ latitude, longitude }) => (
<div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Location</span>
        <a
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-blue-400 hover:text-blue-300 transition"
        >
        ↗ Open in Maps
    </a>
    </div>
    {latitude && longitude ? (
        <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            style={{ height: "220px", width: "100%" }}
    >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} />
    </MapContainer>
    ) : (
    <div className="h-[220px] flex items-center justify-center text-white/20 text-sm">
        Position non disponible
    </div>
    )}
</div>
);

export default ReportLocation;