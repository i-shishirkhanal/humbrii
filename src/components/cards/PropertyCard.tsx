import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Users, Bed, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PropertyCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  propertyType: string;
  compact?: boolean;
}

const PropertyCard = ({
  id,
  name,
  location,
  image,
  rating,
  pricePerNight,
  maxGuests,
  bedrooms,
  propertyType,
  compact = false,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    
    if (isFavorite) {
      const index = favorites.indexOf(id);
      if (index > -1) favorites.splice(index, 1);
      toast.success("Removed from favorites");
    } else {
      favorites.push(id);
      toast.success("Added to favorites");
    }
    
    localStorage.setItem("favorites", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <Link to={`/property/${id}`}>
      <div className={cn(
        "group bg-card rounded-xl overflow-hidden shadow-soft border border-border hover:shadow-strong transition-all duration-300 hover:-translate-y-1",
        compact && "min-w-[200px] sm:min-w-[220px] md:min-w-[260px]"
      )}>
        {/* Image */}
        <div className={cn(
          "relative overflow-hidden",
          compact ? "h-28 sm:h-32 md:h-36" : "h-36 sm:h-40 md:h-48"
        )}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-background/90 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-medium text-foreground">
              {propertyType}
            </span>
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              onClick={toggleFavorite}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                isFavorite 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background/90 backdrop-blur-sm hover:bg-background text-foreground"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", isFavorite && "fill-current")} />
            </button>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-background/90 backdrop-blur-sm rounded-full">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span className="text-[10px] sm:text-xs font-semibold">{rating}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={cn("p-3", compact ? "p-2.5 sm:p-3" : "p-3 sm:p-4")}>
          <h3 className={cn(
            "font-semibold text-card-foreground line-clamp-1",
            compact ? "text-sm" : "text-sm sm:text-base md:text-lg"
          )}>{name}</h3>
          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="text-xs line-clamp-1">{location}</span>
          </div>

          {!compact && (
            <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{maxGuests} guests</span>
              </div>
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" />
                <span>{bedrooms} beds</span>
              </div>
            </div>
          )}

          <div className={cn(
            "flex items-center justify-between",
            compact ? "mt-2" : "mt-3 pt-3 border-t border-border"
          )}>
            <div>
              <span className={cn(
                "font-bold text-card-foreground",
                compact ? "text-sm" : "text-base sm:text-lg md:text-xl"
              )}>NPR {pricePerNight.toLocaleString()}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">/night</span>
            </div>
            {!compact && <Button size="sm" className="text-xs h-8">Book Now</Button>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;