import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import PropertyMap from "@/components/map/PropertyMap";
import BookingWidget from "@/components/booking/BookingWidget";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  MapPin,
  Star,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  UtensilsCrossed,
  Tv,
  Wind,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Clock,
  Map,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/image-utils";

// Amenity icon mapping
const amenityIcons: Record<string, any> = {
  "Free WiFi": Wifi,
  "WiFi": Wifi,
  "Parking": Car,
  "Free Parking": Car,
  "Restaurant": UtensilsCrossed,
  "Kitchen": UtensilsCrossed,
  "TV": Tv,
  "Smart TV": Tv,
  "Air Conditioning": Wind,
  "AC": Wind,
  "Private Bath": Bath,
  "Bathroom": Bath,
};

// Sample property data fallback


const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch property from database with host details
  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          host:profiles(
            full_name,
            avatar_url,
            created_at
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching property:", error);
        return null;
      }
      return data;
    },
    enabled: !!id,
  });

  // Check if property is in favorites
  useEffect(() => {
    if (!property) return;
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(property.id));
  }, [property?.id]);

  const nextImage = () => {
    if (!property?.images) return;
    setCurrentImage((prev) => (prev + 1) % property.images!.length);
  };

  const prevImage = () => {
    if (!property?.images) return;
    setCurrentImage((prev) => (prev - 1 + property.images!.length) % property.images!.length);
  };

  const toggleFavorite = () => {
    if (!property) return;
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    // ... rest matches existing logic but using property directly
    if (!isFavorite) {
      favorites.push(property.id);
      toast.success("Added to favorites");
    } else {
      const index = favorites.indexOf(property.id);
      if (index > -1) favorites.splice(index, 1);
      toast.success("Removed from favorites");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "hourly": return "Hourly";
      case "daycation": return "Daycation";
      case "full_stay": return "Full Stay";
      case "vibe_chill": return "Vibe & Chill";
      default: return "Full Stay";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-6 pt-20 md:pt-24">
        {/* Image Gallery */}
        <div className="relative rounded-xl overflow-hidden mb-6">
          <div className="aspect-video md:aspect-[16/9]">
            <img
              src={getOptimizedImageUrl(property.images?.[currentImage])}
              alt={property.name}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {(property.images || []).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentImage ? "bg-primary w-6" : "bg-background/60"
                )}
              />
            ))}
          </div>

          {/* Action Buttons - moved down to avoid navbar overlap */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={toggleFavorite}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg",
                isFavorite
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/90 backdrop-blur-sm hover:bg-background"
              )}
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
            </button>
            <button className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Property Type Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg">
              {getCategoryLabel(property.category)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Location */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{property.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{property.location || property.address || "Location unavailable"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-semibold">{property.rating}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-sm font-medium text-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>{property.max_guests ?? 2} guests</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-sm font-medium text-foreground">
                <Bed className="w-4 h-4 text-primary" />
                <span>{property.bedrooms ?? 1} bedrooms</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-sm font-medium text-foreground">
                <Bath className="w-4 h-4 text-primary" />
                <span>{property.bathrooms ?? 1} bathrooms</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">About this place</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
              {(!property.amenities || property.amenities.length === 0) ? (
                <p className="text-muted-foreground text-sm">No specific amenities listed.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {property.amenities.map((amenity, idx) => {
                    const IconComponent = amenityIcons[amenity] || Wifi;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3.5 border border-border rounded-xl hover:border-primary/50 hover:bg-muted/30 transition-colors group">
                        <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Host Info */}


            {/* Policies */}
            <div>
              <h2 className="text-xl font-semibold mb-3">House rules</h2>
              <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between max-w-xs">
                  <span>Check-in:</span>
                  <span className="font-medium text-foreground">{property.check_in_time || "Flexible"}</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span>Checkout:</span>
                  <span className="font-medium text-foreground">{property.check_out_time || "Flexible"}</span>
                </div>
              </div>
              {(!property.house_rules || property.house_rules.length === 0) ? (
                <p className="text-sm text-muted-foreground italic">No specific house rules listed.</p>
              ) : (
                <ul className="grid sm:grid-cols-2 gap-3">
                  {property.house_rules.map((policy, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-muted-foreground text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      {policy}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Location Map */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Where you'll be
                </h2>
                <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {property.location || property.address || "Location view"}
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden border border-border shadow-lg h-[400px]">
                <PropertyMap
                  location={property.location || property.address || ""}
                  propertyName={property.name}
                  latitude={property.latitude}
                  longitude={property.longitude}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget
                propertyId={property.id}
                propertyName={property.name}
                pricePerNight={property.base_price || 0}
                maxGuests={property.max_guests ?? 2}
                rating={property.rating || 4.5}
                category={property.category} // Pass category
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default PropertyDetail;
