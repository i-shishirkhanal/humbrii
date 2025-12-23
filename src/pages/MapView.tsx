import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import { X, Clock, Sun, Moon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";

type PropertyCategory = "hourly" | "daycation" | "full_stay" | "vibe_chill";

const categoryConfig: Record<PropertyCategory, { label: string; icon: typeof Clock; color: string; emoji: string }> = {
  hourly: { label: "Hourly", icon: Clock, color: "#f59e0b", emoji: "⏰" },
  daycation: { label: "Daycation", icon: Sun, color: "#10b981", emoji: "☀️" },
  full_stay: { label: "Full Stay", icon: Moon, color: "#6366f1", emoji: "🌙" },
  vibe_chill: { label: "Vibe & Chill", icon: Zap, color: "#ec4899", emoji: "⚡" },
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
      return [
        coords[0] + (Math.random() - 0.5) * 0.02,
        coords[1] + (Math.random() - 0.5) * 0.02,
      ];
    }
  }
  return [27.7172, 85.3240];
};

const MapView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([27.7172, 85.3240], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when filtered properties change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredProperties.forEach((property) => {
      const coords = getCoordinatesFromLocation(property.location);
      const category = property.category as PropertyCategory;
      const config = categoryConfig[category];

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${config.color};
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
            <div style="transform: rotate(45deg); font-size: 14px;">
              ${config.emoji}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker(coords, { icon }).addTo(mapRef.current!);

      const popupContent = `
        <div style="min-width: 200px;">
          ${property.images?.[0] ? `<img src="${property.images[0]}" alt="${property.name}" style="width: 100%; height: 96px; object-fit: cover; border-radius: 8px 8px 0 0; margin-bottom: 8px;" />` : ""}
          <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${property.name}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${property.location}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 12px; padding: 2px 8px; border-radius: 9999px; color: white; background-color: ${config.color};">
              ${config.label}
            </span>
            <span style="font-weight: 600; font-size: 14px;">
              ${property.currency} ${property.base_price}
            </span>
          </div>
          <button 
            onclick="window.location.href='/property/${property.id}'"
            style="width: 100%; padding: 8px; background: hsl(var(--primary)); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });
  }, [filteredProperties, navigate]);

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

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

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
