import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MapPin,
  Calendar as CalendarIcon,
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
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState("");
  const [duration, setDuration] = useState("");

  const handleTypeClick = (type: BookingType) => {
    if (navigateOnTabClick) {
      navigate(`/properties?type=${type}`);
    }
    onTypeChange?.(type);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("type", activeType);
    
    if (location) {
      params.set("location", location);
    }
    if (selectedDate) {
      params.set("date", format(selectedDate, "yyyy-MM-dd"));
    }
    if (guests) {
      params.set("guests", guests);
    }
    if (duration) {
      params.set("duration", duration);
    }

    navigate(`/properties?${params.toString()}`);
  };

  const handleMapClick = () => {
    const category = bookingTypeToCategory(activeType);
    navigate(`/map?category=${category}`);
  };

  const getThirdFieldConfig = () => {
    switch (activeType) {
      case "hourly":
      case "vibe":
        return { label: "Duration", placeholder: "3 Hours", icon: Timer, value: duration, onChange: setDuration };
      case "daycation":
        return { label: "Time Slot", placeholder: "10 AM - 6 PM", icon: Clock, value: duration, onChange: setDuration };
      case "fullstay":
      default:
        return { label: "Guests", placeholder: "2 Guests", icon: Users, value: guests, onChange: setGuests };
    }
  };

  const thirdField = getThirdFieldConfig();

  return (
    <div className={cn("w-full", className)}>
      {/* Booking Type Tabs - Mobile Optimized */}
      {showTabs && (
        <div className="flex justify-center mb-3 md:mb-4 px-1">
          <div className="inline-flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-secondary/80 backdrop-blur-sm rounded-full border border-border overflow-x-auto scrollbar-hide max-w-full">
            {bookingTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeClick(type.id)}
                  className={cn(
                    "flex items-center gap-0.5 sm:gap-1 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  <span>{type.label}</span>
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
            {/* Location Field */}
            <div className="bg-card rounded-lg px-2 py-2 flex flex-col items-start gap-0.5 border border-transparent hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                  Location
                </span>
              </div>
              <input
                type="text"
                placeholder="Kathmandu"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-[11px] font-medium text-foreground placeholder:text-foreground/80 focus:outline-none w-full"
              />
            </div>

            {/* Date Field with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="bg-card rounded-lg px-2 py-2 flex flex-col items-start gap-0.5 border border-transparent hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                      Date
                    </span>
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium w-full truncate",
                    selectedDate ? "text-foreground" : "text-foreground/80"
                  )}>
                    {selectedDate ? format(selectedDate, "MMM d") : "Today"}
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {/* Third Field */}
            <div className="bg-card rounded-lg px-2 py-2 flex flex-col items-start gap-0.5 border border-transparent hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-1">
                <thirdField.icon className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                  {thirdField.label}
                </span>
              </div>
              <input
                type="text"
                placeholder={thirdField.placeholder}
                value={thirdField.value}
                onChange={(e) => thirdField.onChange(e.target.value)}
                className="bg-transparent text-[11px] font-medium text-foreground placeholder:text-foreground/80 focus:outline-none w-full"
              />
            </div>
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
          {/* Location Field */}
          <div className="flex-1 bg-card rounded-lg px-3 py-2.5 flex items-center gap-2.5 border border-transparent hover:border-primary/30 transition-colors">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                Location
              </span>
              <input
                type="text"
                placeholder="Kathmandu"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="w-px h-8 bg-border self-center" />

          {/* Date Field with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex-1 bg-card rounded-lg px-3 py-2.5 flex items-center gap-2.5 border border-transparent hover:border-primary/30 transition-colors cursor-pointer">
                <CalendarIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                    Date
                  </span>
                  <span className={cn(
                    "text-sm font-medium",
                    selectedDate ? "text-foreground" : "text-foreground"
                  )}>
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select date"}
                  </span>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                disabled={(date) => date < new Date()}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <div className="w-px h-8 bg-border self-center" />

          {/* Third Field */}
          <div className="flex-1 bg-card rounded-lg px-3 py-2.5 flex items-center gap-2.5 border border-transparent hover:border-primary/30 transition-colors">
            <thirdField.icon className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                {thirdField.label}
              </span>
              <input
                type="text"
                placeholder={thirdField.placeholder}
                value={thirdField.value}
                onChange={(e) => thirdField.onChange(e.target.value)}
                className="bg-transparent text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
              />
            </div>
          </div>

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
