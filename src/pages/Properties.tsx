import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import PropertyCard from "@/components/cards/PropertyCard";
import SearchWidget, { BookingType } from "@/components/search/SearchWidget";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const bookingTypeLabels: Record<string, string> = {
  hourly: "Hourly",
  daycation: "Daycation",
  fullstay: "Full Stay",
  vibe: "Vibe & Chill",
};

// Map URL type to database category
const typeToCategory = (type: string): string => {
  switch (type) {
    case "hourly": return "hourly";
    case "daycation": return "daycation";
    case "fullstay": return "full_stay";
    case "vibe": return "vibe_chill";
    default: return "full_stay";
  }
};

const Properties = () => {
  const [searchParams] = useSearchParams();
  const typeFromUrl = (searchParams.get("type") || "fullstay") as BookingType;
  const locationFromUrl = searchParams.get("location") || "";
  const guestsFromUrl = searchParams.get("guests") || "";

  const category = typeToCategory(typeFromUrl) as "hourly" | "daycation" | "full_stay" | "vibe_chill";

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("category", category)
        .eq("is_published", true)
        .eq("status", "active");

      if (error) throw error;
      return data || [];
    },
  });

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Filter by location if provided
      if (locationFromUrl) {
        const locationMatch = property.location
          .toLowerCase()
          .includes(locationFromUrl.toLowerCase());
        if (!locationMatch) return false;
      }
      return true;
    });
  }, [properties, locationFromUrl]);

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
            {isLoading ? (
              "Loading properties..."
            ) : (
              <>
                Showing {filteredProperties.length} {pageTitle.toLowerCase()} properties
                {locationFromUrl && ` in "${locationFromUrl}"`}
              </>
            )}
          </p>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-48 mb-3" />
                  <div className="bg-muted rounded h-4 w-3/4 mb-2" />
                  <div className="bg-muted rounded h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  name={property.name}
                  location={property.location}
                  image={property.images?.[0] || "/placeholder.svg"}
                  rating={4.5}
                  pricePerNight={Number(property.base_price)}
                  maxGuests={4}
                  bedrooms={2}
                  propertyType={property.category}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredProperties.length === 0 && (
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
