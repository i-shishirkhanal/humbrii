import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/cards/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";

const allProperties = [
  // Hourly properties
  {
    id: "h1",
    name: "Thamel Urban Retreat",
    location: "Kathmandu, Nepal",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    rating: 4.8,
    pricePerNight: 1500,
    maxGuests: 2,
    bedrooms: 1,
    propertyType: "Hotel",
    bookingType: "hourly",
  },
  {
    id: "h2",
    name: "Lakeside Quick Stay",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    rating: 4.6,
    pricePerNight: 1200,
    maxGuests: 2,
    bedrooms: 1,
    propertyType: "Hotel",
    bookingType: "hourly",
  },
  {
    id: "h3",
    name: "City Center Express",
    location: "Kathmandu, Nepal",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    rating: 4.5,
    pricePerNight: 1000,
    maxGuests: 2,
    bedrooms: 1,
    propertyType: "Hotel",
    bookingType: "hourly",
  },
  // Daycation properties
  {
    id: "d1",
    name: "Mountain Day Escape",
    location: "Nagarkot, Nepal",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    rating: 4.9,
    pricePerNight: 3500,
    maxGuests: 4,
    bedrooms: 2,
    propertyType: "Resort",
    bookingType: "daycation",
  },
  {
    id: "d2",
    name: "Poolside Paradise",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    rating: 4.7,
    pricePerNight: 4200,
    maxGuests: 6,
    bedrooms: 2,
    propertyType: "Resort",
    bookingType: "daycation",
  },
  {
    id: "d3",
    name: "Sunrise Valley Resort",
    location: "Dhulikhel, Nepal",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80",
    rating: 4.8,
    pricePerNight: 3800,
    maxGuests: 4,
    bedrooms: 2,
    propertyType: "Resort",
    bookingType: "daycation",
  },
  // Full Stay properties
  {
    id: "f1",
    name: "Himalayan View Resort",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    rating: 4.9,
    pricePerNight: 8500,
    maxGuests: 4,
    bedrooms: 2,
    propertyType: "Resort",
    bookingType: "fullstay",
  },
  {
    id: "f2",
    name: "Heritage Boutique Hotel",
    location: "Bhaktapur, Nepal",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    rating: 4.8,
    pricePerNight: 6200,
    maxGuests: 2,
    bedrooms: 1,
    propertyType: "Boutique Hotel",
    bookingType: "fullstay",
  },
  {
    id: "f3",
    name: "Lakeside Paradise Villa",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    rating: 4.7,
    pricePerNight: 12000,
    maxGuests: 6,
    bedrooms: 3,
    propertyType: "Villa",
    bookingType: "fullstay",
  },
  // Vibe & Chill properties
  {
    id: "v1",
    name: "Rooftop Lounge & Chill",
    location: "Kathmandu, Nepal",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    rating: 4.8,
    pricePerNight: 2500,
    maxGuests: 8,
    bedrooms: 1,
    propertyType: "Lounge",
    bookingType: "vibe",
  },
  {
    id: "v2",
    name: "Lakeside Sunset Spot",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    rating: 4.9,
    pricePerNight: 3000,
    maxGuests: 6,
    bedrooms: 1,
    propertyType: "Lounge",
    bookingType: "vibe",
  },
  {
    id: "v3",
    name: "Garden Terrace Cafe",
    location: "Patan, Nepal",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    rating: 4.6,
    pricePerNight: 2000,
    maxGuests: 10,
    bedrooms: 1,
    propertyType: "Cafe",
    bookingType: "vibe",
  },
];

const bookingTypeLabels: Record<string, string> = {
  hourly: "Hourly",
  daycation: "Daycation",
  fullstay: "Full Stay",
  vibe: "Vibe & Chill",
};

const locations = ["All Locations", "Pokhara", "Kathmandu", "Bhaktapur", "Nagarkot", "Dhulikhel", "Patan"];

const Properties = () => {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !typeFromUrl || property.bookingType === typeFromUrl;
      const matchesLocation = selectedLocation === "All Locations" || 
                             property.location.includes(selectedLocation);
      
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [searchQuery, typeFromUrl, selectedLocation]);

  const pageTitle = typeFromUrl ? `${bookingTypeLabels[typeFromUrl] || "All"} Properties` : "Explore Properties";
  const pageDescription = typeFromUrl 
    ? `Browse our ${bookingTypeLabels[typeFromUrl]?.toLowerCase() || ""} properties`
    : "Discover the best stays across Nepal";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              {pageDescription}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-card rounded-xl border border-border p-4 md:p-6 mb-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground text-sm md:text-base">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-muted-foreground mb-2 block">
                  Location
                </label>
                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(location)}
                      className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors ${
                        selectedLocation === location
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
            Showing {filteredProperties.length} properties
          </p>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-12 md:py-16">
              <MapPin className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                No properties found
              </h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Properties;