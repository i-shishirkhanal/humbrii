import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { X, Clock, Sun, Moon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";

type PropertyCategory = "hourly" | "daycation" | "full_stay" | "vibe_chill";

const categoryConfig: Record<PropertyCategory, { label: string; icon: typeof Clock; color: string }> = {
  hourly: { label: "Hourly", icon: Clock, color: "#f59e0b" },
  daycation: { label: "Daycation", icon: Sun, color: "#10b981" },
  full_stay: { label: "Full Stay", icon: Moon, color: "#6366f1" },
  vibe_chill: { label: "Vibe & Chill", icon: Zap, color: "#ec4899" },
};

// Create custom marker icons for each category
const createCategoryIcon = (category: PropertyCategory) => {
  const color = categoryConfig[category].color;
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 14px;">
          ${category === "hourly" ? "⏰" : category === "daycation" ? "☀️" : category === "full_stay" ? "🌙" : "⚡"}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

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
      // Add slight randomization to prevent markers stacking
      return [
        coords[0] + (Math.random() - 0.5) * 0.02,
        coords[1] + (Math.random() - 0.5) * 0.02,
      ];
    }
  }
  return [27.7172, 85.3240]; // Default to Kathmandu
};

const MapView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
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

      {/* Map */}
      <MapContainer
        center={[27.7172, 85.3240]}
        zoom={8}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredProperties.map((property) => {
          const coords = getCoordinatesFromLocation(property.location);
          const category = property.category as PropertyCategory;
          return (
            <Marker
              key={property.id}
              position={coords}
              icon={createCategoryIcon(category)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  {property.images?.[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-24 object-cover rounded-t-lg mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-sm mb-1">{property.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{property.location}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: categoryConfig[category].color }}
                    >
                      {categoryConfig[category].label}
                    </span>
                    <span className="font-semibold text-sm">
                      {property.currency} {property.base_price}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

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
