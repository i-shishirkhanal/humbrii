import { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";

interface LocationPickerProps {
    initialLatitude?: number | null;
    initialLongitude?: number | null;
    onLocationSelect: (lat: number, lng: number) => void;
    className?: string;
}

const containerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "0.5rem",
};

const defaultCenter = {
    lat: 27.7172,
    lng: 85.3240, // Kathmandu
};

const LocationPicker = ({ initialLatitude, initialLongitude, onLocationSelect, className }: LocationPickerProps) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number }>(
        initialLatitude && initialLongitude
            ? { lat: initialLatitude, lng: initialLongitude }
            : defaultCenter
    );

    // Sync props to state if they change externally (e.g. via shortened link expansion)
    useEffect(() => {
        if (initialLatitude && initialLongitude) {
            const newCoords = { lat: initialLatitude, lng: initialLongitude };
            setCoords(newCoords);
            map?.panTo(newCoords);
        }
    }, [initialLatitude, initialLongitude, map]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            updateLocation(lat, lng);
        }
    };

    const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            updateLocation(lat, lng);
        }
    };

    const updateLocation = (lat: number, lng: number) => {
        setCoords({ lat, lng });
        onLocationSelect(lat, lng);
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                updateLocation(latitude, longitude);
                map?.panTo({ lat: latitude, lng: longitude });
                map?.setZoom(15);
            }, (error) => {
                console.error("Error getting location", error);
                alert("Could not get your location. Please check browser permissions.");
            });
        }
    };

    if (!isLoaded) {
        return (
            <div className={`w-full h-[300px] rounded-lg border border-input z-0 flex items-center justify-center bg-muted ${className}`}>
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="flex justify-end mb-2">
                <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation} className="h-8 text-xs">
                    <MapPin className="w-3 h-3 mr-1" /> Use Current Location
                </Button>
            </div>

            <div className="w-full h-[300px] rounded-lg border border-input overflow-hidden relative">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={coords}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                >
                    <Marker
                        position={coords}
                        draggable={true}
                        onDragEnd={handleMarkerDragEnd}
                    />
                </GoogleMap>
            </div>

            <p className="text-xs text-muted-foreground mt-1.5 cursor-help" title={`Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`}>
                Coordinate: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} (Click map or drag marker to adjust)
            </p>
        </div>
    );
};

export default LocationPicker;
