import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import PropertyCard from "@/components/cards/PropertyCard";
import SearchWidget, { BookingType } from "@/components/search/SearchWidget";
import { MapPin } from "lucide-react";

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

const Properties = () => {
  const [searchParams] = useSearchParams();
  const typeFromUrl = (searchParams.get("type") || "fullstay") as BookingType;

  const [searchQuery] = useState("");

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = property.bookingType === typeFromUrl;
      
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFromUrl]);

  const pageTitle = bookingTypeLabels[typeFromUrl] || "Properties";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16 md:pt-20 pb-12 md:pb-16">
        {/* Search Widget Section */}
        <section className="bg-gradient-hero py-6 md:py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground text-center mb-4">
              {pageTitle} Properties
            </h1>
            <div className="max-w-4xl mx-auto">
              <SearchWidget
                activeType={typeFromUrl}
                showTabs={true}
                navigateOnTabClick={true}
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 mt-6 md:mt-8">
          {/* Results Count */}
          <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
            Showing {filteredProperties.length} {pageTitle.toLowerCase()} properties
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
                Try a different category or search query
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Properties;