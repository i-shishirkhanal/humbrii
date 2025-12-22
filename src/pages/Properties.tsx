import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/cards/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";

const allProperties = [
  {
    id: "1",
    name: "Himalayan View Resort",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    rating: 4.9,
    pricePerNight: 8500,
    maxGuests: 4,
    bedrooms: 2,
    propertyType: "Resort",
  },
  {
    id: "2",
    name: "Heritage Boutique Hotel",
    location: "Bhaktapur, Nepal",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    rating: 4.8,
    pricePerNight: 6200,
    maxGuests: 2,
    bedrooms: 1,
    propertyType: "Boutique Hotel",
  },
  {
    id: "3",
    name: "Lakeside Paradise Villa",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    rating: 4.7,
    pricePerNight: 12000,
    maxGuests: 6,
    bedrooms: 3,
    propertyType: "Villa",
  },
  {
    id: "4",
    name: "Mountain Retreat Lodge",
    location: "Nagarkot, Nepal",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    rating: 4.6,
    pricePerNight: 5500,
    maxGuests: 4,
    bedrooms: 2,
    propertyType: "Lodge",
  },
  {
    id: "5",
    name: "Thamel Central Hotel",
    location: "Kathmandu, Nepal",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    rating: 4.5,
    pricePerNight: 4200,
    maxGuests: 2,
    bedrooms: 1,
    propertyType: "Hotel",
  },
  {
    id: "6",
    name: "Chitwan Jungle Resort",
    location: "Chitwan, Nepal",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80",
    rating: 4.8,
    pricePerNight: 9800,
    maxGuests: 4,
    bedrooms: 2,
    propertyType: "Resort",
  },
];

const propertyTypes = ["All", "Resort", "Hotel", "Villa", "Boutique Hotel", "Lodge"];
const locations = ["All Locations", "Pokhara", "Kathmandu", "Bhaktapur", "Nagarkot", "Chitwan"];

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProperties = allProperties.filter((property) => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || property.propertyType === selectedType;
    const matchesLocation = selectedLocation === "All Locations" || 
                           property.location.includes(selectedLocation);
    
    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Explore Properties
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover the best stays across Nepal
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search properties or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Property Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedType === type
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Location
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => setSelectedLocation(location)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
            </div>
          )}

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredProperties.length} properties
          </p>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No properties found
              </h3>
              <p className="text-muted-foreground">
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
