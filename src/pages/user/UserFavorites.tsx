import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PropertyCard from "@/components/cards/PropertyCard";
import { Heart } from "lucide-react";

const UserFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  // Sample properties - in real app, fetch from database based on favorite IDs
  const allProperties = [
    {
      id: "h1",
      name: "Thamel Urban Retreat",
      location: "Kathmandu, Nepal",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      rating: 4.8,
      pricePerNight: 1500,
      maxGuests: 2,
      bedrooms: 1,
      propertyType: "Hourly",
    },
    {
      id: "d1",
      name: "Mountain Day Escape",
      location: "Nagarkot, Nepal",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      rating: 4.9,
      pricePerNight: 3500,
      maxGuests: 4,
      bedrooms: 2,
      propertyType: "Daycation",
    },
    {
      id: "f1",
      name: "Himalayan View Resort",
      location: "Pokhara, Nepal",
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
      rating: 4.9,
      pricePerNight: 8500,
      maxGuests: 4,
      bedrooms: 2,
      propertyType: "Full Stay",
    },
  ];

  const favoriteProperties = allProperties.filter(p => favorites.includes(p.id));

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Favorites</h1>
          <p className="text-muted-foreground mt-1">Properties you've saved for later</p>
        </div>

        {favoriteProperties.length === 0 ? (
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
            {favoriteProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserFavorites;
