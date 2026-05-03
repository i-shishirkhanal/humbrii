import { useRef, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

interface PropertyMapProps {
  location: string;
  propertyName: string;
  latitude?: number | null;
  longitude?: number | null;
}

// Nepal locations with coordinates (Fallback)
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

const getCoordinatesFromLocation = (location: string): { lat: number, lng: number } => {
  for (const [city, coords] of Object.entries(locationCoordinates)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return { lat: coords[0], lng: coords[1] };
    }
  }
  return { lat: 27.7172, lng: 85.3240 }; // Default to Kathmandu
};

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "300px",
  borderRadius: "0.5rem",
};

const PropertyMap = ({ location, propertyName, latitude, longitude }: PropertyMapProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const center = useMemo(() => {
    if (latitude && longitude) {
      return { lat: latitude, lng: longitude };
    }
    return getCoordinatesFromLocation(location);
  }, [latitude, longitude, location]);

  const mapRef = useRef<google.maps.Map | null>(null);

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[300px] bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] bg-muted/20 rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onUnmount={() => {
          mapRef.current = null;
        }}
        options={{
          disableDefaultUI: true, // Clean look
          zoomControl: true, // Enable zoom
          gestureHandling: "cooperative", // Better scrolling
        }}
      >
        <Marker
          position={center}
          title={propertyName}
        />
        {/* Privacy Circle logic usually needs 'Circle' component if we want exact equivalent, but Marker is fine for now */}
      </GoogleMap>
    </div>
  );
};

export default PropertyMap;
