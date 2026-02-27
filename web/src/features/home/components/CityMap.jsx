import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CityMap = () => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <MapContainer
        center={[35.7595, -5.83395]}
        zoom={13}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[35.7595, -5.83395]}>
          <Popup>Main Road Issue</Popup>
        </Marker>

        <Marker position={[35.769, -5.845]}>
          <Popup>Streetlight Fixed</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default CityMap;