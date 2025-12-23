import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  location: string;
  propertyName: string;
}

// Nepal locations with coordinates
const locationCoordinates: Record<string, [number, number]> = {
  "Kathmandu": [27.7172, 85.3240],
  "Pokhara": [28.2096, 83.9856],
  "Nagarkot": [27.7172, 85.5200],
  "Bhaktapur": [27.6710, 85.4298],
  "Dhulikhel": [27.6192, 85.5444],
  "Patan": [27.6588, 85.3247],
  "Chitwan": [27.5291, 84.3542],
  "Lumbini": [27.4833, 83.2833],
};

const getCoordinatesFromLocation = (location: string): [number, number] => {
  for (const [city, coords] of Object.entries(locationCoordinates)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  return [27.7172, 85.3240]; // Default to Kathmandu
};

const PropertyMap = ({ location, propertyName }: PropertyMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const coords = getCoordinatesFromLocation(location);

    mapRef.current = L.map(mapContainerRef.current).setView(coords, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    // Add marker
    const icon = L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: hsl(var(--primary));
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          <div style="transform: rotate(45deg); font-size: 16px;">📍</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    L.marker(coords, { icon })
      .addTo(mapRef.current)
      .bindPopup(`<strong>${propertyName}</strong><br/>${location}`);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location, propertyName]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-[300px] rounded-xl overflow-hidden"
      style={{ zIndex: 1 }}
    />
  );
};

export default PropertyMap;
