import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Search,
  Map,
  Sun,
  Moon,
  Zap,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BookingType = "hourly" | "daycation" | "fullstay" | "vibe";

interface SearchWidgetProps {
  activeType: BookingType;
  onTypeChange?: (type: BookingType) => void;
  showTabs?: boolean;
  className?: string;
  navigateOnTabClick?: boolean;
}

const bookingTypes = [
  { id: "hourly" as BookingType, label: "Hourly", icon: Clock },
  { id: "daycation" as BookingType, label: "Daycation", icon: Sun },
  { id: "fullstay" as BookingType, label: "Full Stay", icon: Moon },
  { id: "vibe" as BookingType, label: "Vibe & Chill", icon: Zap },
];

// Search fields config based on booking type
const getSearchFields = (type: BookingType) => {
  switch (type) {
    case "hourly":
      return [
        { id: "location", label: "Location", placeholder: "Kathmandu", icon: MapPin },
        { id: "date", label: "Date", placeholder: "Today", icon: Calendar },
        { id: "duration", label: "Duration", placeholder: "3 Hours", icon: Timer },
      ];
    case "daycation":
      return [
        { id: "location", label: "Location", placeholder: "Kathmandu", icon: MapPin },
        { id: "date", label: "Date", placeholder: "Today", icon: Calendar },
        { id: "time", label: "Time Slot", placeholder: "10 AM - 6 PM", icon: Clock },
      ];
    case "fullstay":
      return [
        { id: "location", label: "Location", placeholder: "Kathmandu", icon: MapPin },
        { id: "date", label: "Date", placeholder: "Today", icon: Calendar },
        { id: "guests", label: "Guests", placeholder: "2 Guests", icon: Users },
      ];
    case "vibe":
      return [
        { id: "location", label: "Location", placeholder: "Kathmandu", icon: MapPin },
        { id: "date", label: "Date", placeholder: "Today", icon: Calendar },
        { id: "duration", label: "Duration", placeholder: "3 Hours", icon: Timer },
      ];
    default:
      return [
        { id: "location", label: "Location", placeholder: "Kathmandu", icon: MapPin },
        { id: "date", label: "Date", placeholder: "Today", icon: Calendar },
        { id: "guests", label: "Guests", placeholder: "2 Guests", icon: Users },
      ];
  }
};

// Map booking type to database category
const bookingTypeToCategory = (type: BookingType): string => {
  switch (type) {
    case "hourly": return "hourly";
    case "daycation": return "daycation";
    case "fullstay": return "full_stay";
    case "vibe": return "vibe_chill";
    default: return "full_stay";
  }
};

const SearchWidget = ({
  activeType,
  onTypeChange,
  showTabs = true,
  className,
  navigateOnTabClick = false,
}: SearchWidgetProps) => {
  const navigate = useNavigate();
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});

  const handleTypeClick = (type: BookingType) => {
    if (navigateOnTabClick) {
      navigate(`/properties?type=${type}`);
    }
    onTypeChange?.(type);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setSearchValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("type", activeType);
    
    if (searchValues.location) {
      params.set("location", searchValues.location);
    }
    if (searchValues.date) {
      params.set("date", searchValues.date);
    }
    if (searchValues.guests) {
      params.set("guests", searchValues.guests);
    }
    if (searchValues.duration) {
      params.set("duration", searchValues.duration);
    }
    if (searchValues.time) {
      params.set("time", searchValues.time);
    }

    navigate(`/properties?${params.toString()}`);
  };

  const handleMapClick = () => {
    const category = bookingTypeToCategory(activeType);
    navigate(`/map?category=${category}`);
  };

  const searchFields = getSearchFields(activeType);

  return (
    <div className={cn("w-full", className)}>
      {/* Booking Type Tabs - Mobile Optimized */}
      {showTabs && (
        <div className="flex justify-center mb-3 md:mb-4 px-1">
          <div className="inline-flex items-center gap-1 p-1 bg-secondary/80 backdrop-blur-sm rounded-full border border-border overflow-x-auto scrollbar-hide max-w-full">
            {bookingTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeClick(type.id)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 rounded-full text-[11px] sm:text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline sm:inline">{type.label}</span>
                  <span className="xs:hidden sm:hidden">{type.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Widget - Mobile Optimized */}
      <div className="bg-secondary/80 backdrop-blur-sm rounded-xl border border-border p-2 md:p-2.5">
        {/* Mobile: Stacked Layout */}
        <div className="flex flex-col gap-2 md:hidden">
          {/* Search Fields Row */}
          <div className="grid grid-cols-3 gap-1.5">
            {searchFields.map((field) => {
              const Icon = field.icon;
              return (
                <div 
                  key={field.id} 
                  className="bg-card rounded-lg px-2 py-2 flex flex-col items-start gap-0.5 border border-transparent hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <Icon className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                      {field.label}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={searchValues[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="bg-transparent text-[11px] font-medium text-foreground placeholder:text-foreground/80 focus:outline-none w-full"
                  />
                </div>
              );
            })}
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleMapClick}
              className="p-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors flex-shrink-0"
            >
              <Map className="w-4 h-4 text-muted-foreground" />
            </button>
            <Button size="sm" className="flex-1 h-9 rounded-lg text-xs" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-1.5" />
              Search
            </Button>
          </div>
        </div>

        {/* Tablet/Desktop: Horizontal Layout */}
        <div className="hidden md:flex items-stretch gap-2">
          {searchFields.map((field, index) => {
            const Icon = field.icon;
            return (
              <div key={field.id} className="contents">
                <div className="flex-1 bg-card rounded-lg px-3 py-2.5 flex items-center gap-2.5 border border-transparent hover:border-primary/30 transition-colors">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                      {field.label}
                    </span>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={searchValues[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="bg-transparent text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                    />
                  </div>
                </div>
                {index < searchFields.length - 1 && (
                  <div className="w-px h-8 bg-border self-center" />
                )}
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleMapClick}
              className="p-2.5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <Map className="w-4 h-4 text-muted-foreground" />
            </button>
            <Button size="sm" className="h-10 px-4 rounded-lg" onClick={handleSearch}>
              <Search className="w-4 h-4" />
              <span className="ml-1.5">Search</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchWidget;
