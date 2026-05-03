
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import PropertyCard from "@/components/cards/PropertyCard";
import SearchWidget, { BookingType } from "@/components/search/SearchWidget";
import { MapPin, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { propertiesService } from "@/services/properties.service";
import { PropertyCategory, PROPERTY_CATEGORIES } from "@/config/constants";
import { Button } from "@/components/ui/button";

const bookingTypeLabels: Record<string, string> = {
  hourly: "Hourly",
  daycation: "Daycation",
  fullstay: "Full Stay",
  vibe: "Vibe & Chill",
};

// Map URL type to database category
const typeToCategory = (type: string): PropertyCategory => {
  switch (type) {
    case "hourly": return PROPERTY_CATEGORIES.HOURLY;
    case "daycation": return PROPERTY_CATEGORIES.DAYCATION;
    case "fullstay": return PROPERTY_CATEGORIES.FULL_STAY;
    case "vibe": return PROPERTY_CATEGORIES.VIBE_CHILL;
    default: return PROPERTY_CATEGORIES.FULL_STAY;
  }
};

const Properties = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(0);

  const typeFromUrl = (searchParams.get("type") || "fullstay") as BookingType;
  const locationFromUrl = searchParams.get("location") || "";

  const category = typeToCategory(typeFromUrl);

  // Reset page when category or location changes
  useEffect(() => {
    setPage(0);
  }, [category, locationFromUrl]);

  const { data: properties = [], isLoading, isFetching } = useQuery({
    queryKey: ["properties", category, page, locationFromUrl],
    queryFn: () => propertiesService.getProperties(page, category, "active", locationFromUrl),
    placeholderData: keepPreviousData,
  });

  // Client-side filtering removed in favor of Server-side search
  const filteredProperties = properties;

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
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <p className="text-xs md:text-sm text-muted-foreground">
              {isLoading ? (
                "Loading properties..."
              ) : (
                <>
                  Showing {filteredProperties.length} results (Page {page + 1})
                  {locationFromUrl && ` matching "${locationFromUrl}"`}
                </>
              )}
            </p>
          </div>

          {/* Properties Grid */}
          {isLoading && !properties.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-32 md:h-40 mb-3" />
                  <div className="bg-muted rounded h-4 w-3/4 mb-2" />
                  <div className="bg-muted rounded h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    name={property.name}
                    location={property.location || property.address || "Location not available"}
                    image={property.images?.[0] || "/placeholder.svg"}
                    rating={4.5} // TODO: Add real rating logic
                    pricePerNight={Number(property.base_price || 0)}
                    maxGuests={property.max_guests || 2}
                    beds={property.beds || 1}
                    bathrooms={property.bathrooms || 1}
                    propertyType={property.category}
                    compact={true}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center flex-col items-center gap-2 mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0 || isFetching}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={properties.length < 10 || isFetching} // Assuming PAGE_SIZE is 10
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {isFetching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
            </>
          )}

          {!isLoading && filteredProperties.length === 0 && (
            <div className="text-center py-12 md:py-16">
              <MapPin className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                No properties found
              </h3>
              <p className="text-muted-foreground text-sm">
                Try a different category or page
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
