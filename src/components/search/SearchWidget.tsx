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

const SearchWidget = ({
  activeType,
  onTypeChange,
  showTabs = true,
  className,
  navigateOnTabClick = false,
}: SearchWidgetProps & { navigateOnTabClick?: boolean }) => {
  const navigate = useNavigate();

  const handleTypeClick = (type: BookingType) => {
    if (navigateOnTabClick) {
      navigate(`/properties?type=${type}`);
    }
    onTypeChange?.(type);
  };
  const searchFields = getSearchFields(activeType);

  return (
    <div className={cn("w-full", className)}>
      {/* Booking Type Tabs */}
      {showTabs && (
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-0.5 p-1 bg-secondary/80 backdrop-blur-sm rounded-full border border-border">
            {bookingTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeClick(type.id)}
                  className={`flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Widget */}
      <div className="bg-secondary/80 backdrop-blur-sm rounded-xl border border-border p-1.5 md:p-2">
        <div className="flex flex-col sm:flex-row items-stretch gap-1.5 md:gap-2">
          {searchFields.map((field, index) => {
            const Icon = field.icon;
            return (
              <div key={field.id} className="contents">
                <div className="flex-1 bg-card rounded-lg px-3 py-2 flex items-center gap-2 border border-transparent hover:border-primary/30 transition-colors">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                      {field.label}
                    </span>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="bg-transparent text-xs md:text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                    />
                  </div>
                </div>
                {index < searchFields.length - 1 && (
                  <div className="hidden sm:block w-px h-8 bg-border self-center" />
                )}
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button className="p-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
              <Map className="w-4 h-4 text-muted-foreground" />
            </button>
            <Button size="sm" className="h-9 px-3 md:px-4 rounded-lg">
              <Search className="w-4 h-4" />
              <span className="ml-1.5 hidden sm:inline">Search</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchWidget;