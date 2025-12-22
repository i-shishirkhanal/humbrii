import { MapPin, Star, Users, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

const PropertyCard = ({
  name,
  location,
  image,
  rating,
  pricePerNight,
  maxGuests,
  bedrooms,
  propertyType,
}: PropertyCardProps) => {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft border border-border hover:shadow-strong transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
            {propertyType}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-full">
          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="text-xs font-semibold">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-card-foreground line-clamp-1">{name}</h3>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{maxGuests} guests</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{bedrooms} beds</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div>
            <span className="text-xl font-bold text-card-foreground">NPR {pricePerNight.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">/night</span>
          </div>
          <Button size="sm">Book Now</Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
