import { useState, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { X, Clock, Sun, Moon, Zap, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type PropertyCategory = "hourly" | "daycation" | "full_stay" | "vibe_chill";

const categoryConfig: Record<PropertyCategory, { label: string; icon: typeof Clock; color: string; emoji: string }> = {
  hourly: { label: "Hourly", icon: Clock, color: "#f59e0b", emoji: "⏰" },
  daycation: { label: "Daycation", icon: Sun, color: "#10b981", emoji: "☀️" },
  full_stay: { label: "Full Stay", icon: Moon, color: "#6366f1", emoji: "🌙" },
  vibe_chill: { label: "Vibe & Chill", icon: Zap, color: "#ec4899", emoji: "⚡" },
};

// Nepal locations with coordinates
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  "Kathmandu": { lat: 27.7172, lng: 85.3240 },
  "Pokhara": { lat: 28.2096, lng: 83.9856 },
  "Nagarkot": { lat: 27.7172, lng: 85.5200 },
  "Bhaktapur": { lat: 27.6710, lng: 85.4298 },
  "Dhulikhel": { lat: 27.6192, lng: 85.5444 },
  "Patan": { lat: 27.6588, lng: 85.3247 },
  "Chitwan": { lat: 27.5291, lng: 84.3542 },
  "Lumbini": { lat: 27.4833, lng: 83.2833 },
};

// Helper to fuzz coordinates slightly to prevent exact overlap
const getCoordinatesFromLocation = (location: string): { lat: number; lng: number } => {
  for (const [city, coords] of Object.entries(locationCoordinates)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.02,
        lng: coords.lng + (Math.random() - 0.5) * 0.02,
      };
    }
  }
  return { lat: 27.7172, lng: 85.3240 };
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 27.7172,
  lng: 85.3240,
};

const MapView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const initialCategory = searchParams.get("category") as PropertyCategory | null;
  const [activeCategories, setActiveCategories] = useState<PropertyCategory[]>(
    initialCategory ? [initialCategory] : ["hourly", "daycation", "full_stay", "vibe_chill"]
  );

  const { data: properties = [] } = useQuery({
    queryKey: ["map-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .eq("status", "active");

      if (error) throw error;
      return data || [];
    },
  });

  const toggleCategory = (category: PropertyCategory) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredProperties = properties.filter((p) =>
    activeCategories.includes(p.category as PropertyCategory)
  );

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    // Try to get user location on load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(pos);
        const userMarker = new google.maps.Marker({
          position: pos,
          map: map,
          title: "You are here",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          }
        });
      }, () => {
        // Handle location error or denial
      });
    }
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-3">
          <h1 className="text-lg font-semibold">Explore Properties</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Location Button */}
        <div className="absolute top-20 right-4 z-[1000]">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg bg-background/95 backdrop-blur-sm border border-border"
            onClick={() => {
              if (navigator.geolocation && map) {
                navigator.geolocation.getCurrentPosition((position) => {
                  const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  };
                  map.panTo(pos);
                  map.setZoom(13);
                }, () => toast.error("Location access denied"));
              }
            }}
          >
            <Navigation className="w-4 h-4 text-primary" />
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-hide">
          {(Object.keys(categoryConfig) as PropertyCategory[]).map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            const isActive = activeCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isActive
                  ? "text-white shadow-md"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                style={{
                  backgroundColor: isActive ? config.color : undefined,
                }}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={8}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: true,
            zoomControl: false, // We use custom zoom or gestures
          }}
        >
          {filteredProperties.map((property) => {
            const coords = getCoordinatesFromLocation(property.location);
            const category = property.category as PropertyCategory;
            const config = categoryConfig[category];

            return (
              <Marker
                key={property.id}
                position={coords}
                onClick={() => setSelectedProperty(property)}
                // Using SVG path for custom colored markers
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                  fillColor: config.color,
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "white",
                  scale: 1.5,
                  anchor: new google.maps.Point(12, 24),
                }}
              />
            );
          })}

          {selectedProperty && (
            <InfoWindow
              position={getCoordinatesFromLocation(selectedProperty.location)}
              onCloseClick={() => setSelectedProperty(null)}
            >
              <div className="min-w-[200px] max-w-[240px] font-sans">
                {selectedProperty.images?.[0] && (
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.name}
                    className="w-full h-24 object-cover rounded-t-lg mb-2"
                  />
                )}
                <h3 className="font-semibold text-sm mb-1">{selectedProperty.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{selectedProperty.location}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: categoryConfig[selectedProperty.category as PropertyCategory].color }}>
                    {categoryConfig[selectedProperty.category as PropertyCategory].label}
                  </span>
                  <span className="font-semibold text-sm">
                    {selectedProperty.currency} {selectedProperty.base_price}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/property/${selectedProperty.id}`)}
                  className="w-full py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Properties count */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border">
          <span className="text-sm font-medium">
            {filteredProperties.length} properties found
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
