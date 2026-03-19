import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LiveMap = ({ reports = [] }) => {
const pins = reports.filter(r => r.latitude && r.longitude);

  // ✅ Centre de la carte selon les rapports visibles
const center = pins.length > 0
    ? [pins[0].latitude, pins[0].longitude]
    : [35.57, -5.37];

return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10">

    <div className="absolute top-3 left-3 z-[999] bg-black/60 backdrop-blur-sm text-xs text-white px-3 py-1.5 rounded-full flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        LIVE OPERATIONS · {pins.length} Pins in current view
    </div>

      {/* ✅ key change quand les rapports changent → Leaflet se recrée */}
    <MapContainer
        key={pins.map(r => r.id).join(",")}
        center={center}
        zoom={13}
        style={{ height: "350px", width: "100%" }}
        zoomControl={false}
    >
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
        />
        {pins.map(r => (
        <Marker key={r.id} position={[r.latitude, r.longitude]}>
            <Popup>
                <strong>{r.title}</strong><br />
                {r.category?.name}<br />
                {r.status?.replace("_", " ")}
            </Popup>
        </Marker>
        ))}
    </MapContainer>

    </div>
);
};

export default LiveMap;