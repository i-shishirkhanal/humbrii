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
const samplePropertyData = {
  id: "1",
  name: "Himalayan View Resort",
  location: "Pokhara, Nepal",
  images: [
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
  ],
  rating: 4.9,
  reviews: 128,
  base_price: 8500,
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 2,
  category: "full_stay",
  description: "Experience the breathtaking beauty of the Himalayas from this luxurious resort. Nestled in the heart of Pokhara, our resort offers stunning mountain views, world-class amenities, and exceptional service.",
  amenities: ["Free WiFi", "Free Parking", "Restaurant", "Smart TV", "Air Conditioning", "Private Bath"],
  host: {
    name: "Ram Sharma",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    joinedDate: "2020",
    responseRate: "98%",
  },
  policies: [
    "Check-in: 2:00 PM - 10:00 PM",
    "Checkout: 11:00 AM",
    "No smoking",
    "No parties or events",
    "Pets allowed",
  ],
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch property from database
  const { data: dbProperty, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("properties")
        .select("*")
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

  // Use database property or fallback to sample
  const property = dbProperty ? {
    ...samplePropertyData,
    id: dbProperty.id,
    name: dbProperty.name,
    location: dbProperty.location,
    images: dbProperty.images?.length ? dbProperty.images : samplePropertyData.images,
    base_price: dbProperty.base_price,
    category: dbProperty.category,
    description: dbProperty.description || samplePropertyData.description,
    amenities: dbProperty.amenities?.length ? dbProperty.amenities : samplePropertyData.amenities,
  } : samplePropertyData;

  // Check if property is in favorites
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(property.id));
  }, [property.id]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
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

      <main className="container mx-auto px-4 py-6">
        {/* Image Gallery */}
        <div className="relative rounded-xl overflow-hidden mb-6">
          <div className="aspect-[16/9] md:aspect-[21/9]">
            <img
              src={property.images[currentImage]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {property.images.map((_, idx) => (
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

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={toggleFavorite}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isFavorite 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background/80 backdrop-blur-sm hover:bg-background"
              )}
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
            </button>
            <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Property Type Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
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
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-muted-foreground">({property.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span>{property.maxGuests} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-muted-foreground" />
                <span>{property.bedrooms} bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-muted-foreground" />
                <span>{property.bathrooms} bathrooms</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">About this place</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-3">What this place offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, idx) => {
                  const IconComponent = amenityIcons[amenity] || Wifi;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host Info */}
            <div className="p-4 bg-card border border-border rounded-xl">
              <h2 className="text-xl font-semibold mb-3">Hosted by {property.host.name}</h2>
              <div className="flex items-center gap-4">
                <img
                  src={property.host.image}
                  alt={property.host.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Joined in {property.host.joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Shield className="w-4 h-4" />
                    <span>{property.host.responseRate} response rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div>
              <h2 className="text-xl font-semibold mb-3">House rules</h2>
              <ul className="space-y-2">
                {property.policies.map((policy, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-success" />
                    {policy}
                  </li>
                ))}
              </ul>
            </div>

            {/* Location Map */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                Location
              </h2>
              <p className="text-muted-foreground mb-3 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {property.location}
              </p>
              <PropertyMap 
                location={property.location} 
                propertyName={property.name} 
              />
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget
                propertyId={property.id}
                propertyName={property.name}
                pricePerNight={property.base_price}
                maxGuests={property.maxGuests}
                rating={property.rating}
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
