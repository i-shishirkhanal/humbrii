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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  LucideIcon,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BookingType = "hourly" | "daycation" | "fullstay" | "vibe";

const bookingTypes = [
  { id: "hourly" as BookingType, label: "Hourly", icon: Clock },
  { id: "daycation" as BookingType, label: "Daycation", icon: Sun },
  { id: "fullstay" as BookingType, label: "Full Stay", icon: Moon },
  { id: "vibe" as BookingType, label: "Vibe & Chill", icon: Zap },
];

const nepalCities = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara",
  "Biratnagar", "Birgunj", "Bharatpur", "Janakpur",
  "Dharan", "Butwal", "Hetauda", "Nepalgunj",
  "Itahari", "Dhangadhi", "Siddharthanagar", "Damak",
  "Kalaiya", "Kirtipur", "Triyuga", "Lahan",
  "Rajbiraj", "Tikapur", "Birendranagar", "Gorkha",
  "Ilam", "Dhankuta", "Banepa", "Dhulikhel"
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

interface SearchFieldProps {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchField = ({ icon: Icon, label, value, onChange, placeholder, className }: SearchFieldProps) => (
  // Mobile: flex-col with smaller text, Desktop: flex-row with larger text
  <div className={cn(
    "bg-card rounded-lg px-2 py-2 md:px-3 md:py-2.5 flex items-start md:items-center gap-0.5 md:gap-2.5 border border-transparent hover:border-primary/30 transition-colors",
    "flex-col md:flex-row flex-1 min-w-0", // Responsive layout switch
    className
  )}>
    <div className="flex items-center gap-1 md:gap-0">
      <Icon className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
      <span className="md:hidden text-[8px] uppercase tracking-wider text-muted-foreground font-medium truncate">
        {label}
      </span>
    </div>

    <div className="flex flex-col items-start flex-1 min-w-0 w-full">
      <span className="hidden md:block text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[11px] md:text-sm font-medium text-foreground placeholder:text-foreground/80 md:placeholder:text-foreground focus:outline-none w-full"
      />
    </div>
  </div>
);

// New Component for Fields with Popup Options (Location, Duration)
interface SelectSearchFieldProps extends SearchFieldProps {
  options: string[];
  searchable?: boolean;
}

const SelectSearchField = ({ icon: Icon, label, value, onChange, placeholder, className, options, searchable = false }: SelectSearchFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn(
          "bg-card rounded-lg px-2 py-2 md:px-3 md:py-2.5 flex items-start md:items-center gap-0.5 md:gap-2.5 border border-transparent hover:border-primary/30 transition-colors cursor-pointer",
          "flex-col md:flex-row flex-1 min-w-0",
          className
        )}>
          <div className="flex items-center gap-1 md:gap-0">
            <Icon className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            <span className="md:hidden text-[8px] uppercase tracking-wider text-muted-foreground font-medium truncate">
              {label}
            </span>
          </div>

          <div className="flex flex-col items-start flex-1 min-w-0 w-full text-left">
            <span className="hidden md:block text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
              {label}
            </span>
            {/* Use basic input for display but readOnly to force popup usage for "easy" experience, 
                 OR allow typing. User said "make easy to select... put popup". 
                 Hybrid approach: Input works, but clicking anywhere opens popup. */}
            <input
              type="text"
              readOnly
              placeholder={placeholder}
              value={value}
              className="bg-transparent text-[11px] md:text-sm font-medium text-foreground placeholder:text-foreground/80 md:placeholder:text-foreground focus:outline-none w-full cursor-pointer"
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        {searchable ? (
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="h-9" />
            <CommandList>
              <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={(currentValue) => {
                      // CommandItem lowercases values, so we use the original option text
                      // Or rely on currentValue if it preserves casing (usually it doesn't).
                      // Better to find the original option that matches.
                      const original = options.find(o => o.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                      onChange(original);
                      setIsOpen(false);
                    }}
                    className="text-sm"
                  >
                    {option}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <div className="flex flex-col gap-0.5 p-1">
            {options.map((option) => (
              <button
                key={option}
                className={cn(
                  "text-left px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-between",
                  value === option && "bg-accent/50 font-medium"
                )}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
                {value === option && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};


const DateSearchField = ({ date, onSelect, className }: { date: Date | undefined, onSelect: (date: Date | undefined) => void, className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn(
          "bg-card rounded-lg px-2 py-2 md:px-3 md:py-2.5 flex items-start md:items-center gap-0.5 md:gap-2.5 border border-transparent hover:border-primary/30 transition-colors cursor-pointer",
          "flex-col md:flex-row flex-1 min-w-0",
          className
        )}>
          <div className="flex items-center gap-1 md:gap-0">
            <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            <span className="md:hidden text-[8px] uppercase tracking-wider text-muted-foreground font-medium truncate">
              Date
            </span>
          </div>

          <div className="flex flex-col items-start flex-1 min-w-0 w-full text-left"> {/* Added text-left */}
            <span className="hidden md:block text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
              Date
            </span>
            <span className={cn(
              "text-[11px] md:text-sm font-medium w-full truncate text-left", // Added text-left
              date ? "text-foreground" : "text-foreground/80 md:text-foreground"
            )}>
              {date ? format(date, "MMM d, yyyy") : <span className="md:hidden">Today</span>}
              {/* Desktop placeholder logic */}
              {!date && <span className="hidden md:inline">Select date</span>}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onSelect(d);
            setIsOpen(false);
          }}
          initialFocus
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};

const SearchWidget = ({
  activeType,
  onTypeChange,
  showTabs = true,
  className,
  navigateOnTabClick = false,
}: SearchWidgetProps) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(""); // Default location
  // Default to today
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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

    if (location) params.set("location", location);
    if (selectedDate) params.set("date", format(selectedDate, "yyyy-MM-dd"));
    if (guests) params.set("guests", guests);
    if (duration) params.set("duration", duration);

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
        return {
          label: "Duration",
          placeholder: "Select Duration",
          icon: Timer,
          value: duration,
          onChange: setDuration,
          options: ["3 Hours", "6 Hours", "9 Hours"]
        };
      case "daycation":
        return {
          label: "Time Slot",
          placeholder: "10 AM - 6 PM",
          icon: Clock,
          value: duration,
          onChange: setDuration,
          // For daycation, maybe no preset options or just one fixed one? The user only mentioned "3 6 9 hour" for duration.
          // Let's assume standard input for daycation if not specified, or same component if options exist.
          // "10 AM - 6 PM" implies a specific slot. Let's keep input for now or single option.
          options: []
        };
      case "fullstay":
      default:
        return {
          label: "Guests",
          placeholder: "2 Guests",
          icon: Users,
          value: guests,
          onChange: setGuests,
          options: [] // No presets for guests requested yet
        };
    }
  };

  const thirdField = getThirdFieldConfig();

  return (
    <div className={cn("w-full", className)}>
      {/* Booking Type Tabs */}
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
                      : "text-white/80 hover:text-white"
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

      {/* Search Widget Container */}
      <div className="bg-secondary/80 backdrop-blur-sm rounded-xl border border-border p-2 md:p-2.5">

        {/* Mobile: Grid Layout */}
        <div className="md:hidden flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-1.5">
            {/* Switched to SelectSearchField for Location */}
            <SelectSearchField
              icon={MapPin}
              label="Location"
              placeholder="Select"
              value={location}
              onChange={setLocation}
              options={nepalCities}
              searchable={true}
            />

            <DateSearchField
              date={selectedDate}
              onSelect={setSelectedDate}
            />

            {/* Conditionally render Select or Standard input based on options presence */}
            {thirdField.options && thirdField.options.length > 0 ? (
              <SelectSearchField
                icon={thirdField.icon}
                label={thirdField.label}
                placeholder={thirdField.placeholder}
                value={thirdField.value}
                onChange={thirdField.onChange}
                options={thirdField.options}
                searchable={false}
              />
            ) : (
              <SearchField
                icon={thirdField.icon}
                label={thirdField.label}
                placeholder={thirdField.placeholder}
                value={thirdField.value}
                onChange={thirdField.onChange}
              />
            )}
          </div>

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

        {/* Desktop: Horizontal Flex Layout */}
        <div className="hidden md:flex items-stretch gap-2">
          {/* Switched to SelectSearchField for Location */}
          <SelectSearchField
            icon={MapPin}
            label="Location"
            placeholder="Select Location"
            value={location}
            onChange={setLocation}
            options={nepalCities}
            searchable={true}
          />

          <div className="w-px h-8 bg-border self-center" />

          <DateSearchField
            date={selectedDate}
            onSelect={setSelectedDate}
          />

          <div className="w-px h-8 bg-border self-center" />

          {thirdField.options && thirdField.options.length > 0 ? (
            <SelectSearchField
              icon={thirdField.icon}
              label={thirdField.label}
              placeholder={thirdField.placeholder}
              value={thirdField.value}
              onChange={thirdField.onChange}
              options={thirdField.options}
              searchable={false}
            />
          ) : (
            <SearchField
              icon={thirdField.icon}
              label={thirdField.label}
              placeholder={thirdField.placeholder}
              value={thirdField.value}
              onChange={thirdField.onChange}
            />
          )}

          <div className="flex items-center gap-1.5 pl-2">
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

