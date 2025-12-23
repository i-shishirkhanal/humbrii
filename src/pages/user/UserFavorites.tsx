import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import PropertyCard from "@/components/cards/PropertyCard";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const UserFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      const stored = localStorage.getItem("favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    };
    
    loadFavorites();
    
    // Listen for storage changes to update favorites in real-time
    const handleStorageChange = () => {
      loadFavorites();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("favoritesUpdated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favoritesUpdated", handleStorageChange);
    };
  }, []);

  // Fetch actual properties from database
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["favoriteProperties", favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .in("id", favorites);
      
      if (error) throw error;
      return data || [];
    },
    enabled: favorites.length > 0,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Favorites</h1>
            <p className="text-muted-foreground mt-1">Properties you've saved for later</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">
                Start exploring properties and tap the heart icon to save your favorites!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  name={property.name}
                  location={property.location}
                  image={property.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                  rating={4.8}
                  pricePerNight={property.base_price}
                  maxGuests={4}
                  bedrooms={2}
                  propertyType={property.category}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default UserFavorites;
