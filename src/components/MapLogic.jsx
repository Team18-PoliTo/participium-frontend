import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

export function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export const SearchBar = ({ onLocationSelected }) => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      autoClose: true,
      keepResult: false,
    });
    map.addControl(searchControl);
    
    const handleLocation = (result) => {
      const { x: lng, y: lat } = result.location;
      onLocationSelected({ lat, lng }, map);
    };

    map.on("geosearch/showlocation", handleLocation);
    
    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", handleLocation);
    };
  }, [map, onLocationSelected]);
  return null;
};

export function MapResizer({ isSidebarOpen }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [isSidebarOpen, map]);
  return null;
}