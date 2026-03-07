// MapController - Component to control map centering and zoom
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

export default MapController;

