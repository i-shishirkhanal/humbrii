import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import PropertyMap from "@/components/map/PropertyMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Calendar,
  Check,
  Shield,
  Clock,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample property data
const propertyData = {
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
  pricePerNight: 8500,
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 2,
  propertyType: "Full Stay",
  description: "Experience the breathtaking beauty of the Himalayas from this luxurious resort. Nestled in the heart of Pokhara, our resort offers stunning mountain views, world-class amenities, and exceptional service. Perfect for couples, families, or solo travelers seeking a peaceful retreat.",
  amenities: [
    { icon: Wifi, label: "Free WiFi" },
    { icon: Car, label: "Free Parking" },
    { icon: UtensilsCrossed, label: "Restaurant" },
    { icon: Tv, label: "Smart TV" },
    { icon: Wind, label: "Air Conditioning" },
    { icon: Bath, label: "Private Bath" },
  ],
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
  const [paymentType, setPaymentType] = useState("full");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);

  const property = propertyData;

  const totalAmount = property.pricePerNight * 2; // Assuming 2 nights
  const partialAmount = Math.round(totalAmount * 0.2);
  const remainingAmount = totalAmount - partialAmount;

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
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
  };

  const handleCheckout = () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    setShowCheckout(true);
  };

  const handlePayment = () => {
    const amount = paymentType === "full" ? totalAmount : partialAmount;
    toast.success(`Redirecting to eSewa for NPR ${amount.toLocaleString()} payment...`);
    // In real implementation, integrate with eSewa API
    setTimeout(() => {
      toast.success("Booking confirmed! You will receive a confirmation email.");
      navigate("/dashboard/bookings");
    }, 2000);
  };

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
              {property.propertyType}
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
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <amenity.icon className="w-5 h-5 text-primary" />
                    <span>{amenity.label}</span>
                  </div>
                ))}
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

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6 shadow-lg">
              {!showCheckout ? (
                <>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold">NPR {property.pricePerNight.toLocaleString()}</span>
                      <span className="text-muted-foreground"> /night</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span className="font-semibold">{property.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="checkin">Check-in</Label>
                        <Input
                          id="checkin"
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="checkout">Check-out</Label>
                        <Input
                          id="checkout"
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="guests">Guests</Label>
                      <Input
                        id="guests"
                        type="number"
                        min={1}
                        max={property.maxGuests}
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>

                    <Button className="w-full" size="lg" onClick={handleCheckout}>
                      Reserve Now
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      You won't be charged yet
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">NPR {property.pricePerNight.toLocaleString()} x 2 nights</span>
                      <span>NPR {totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service fee</span>
                      <span>NPR 500</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-3 border-t border-border">
                      <span>Total</span>
                      <span>NPR {(totalAmount + 500).toLocaleString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-4">Payment Options</h3>
                  
                  <RadioGroup value={paymentType} onValueChange={setPaymentType} className="space-y-3">
                    <div className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      paymentType === "full" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground"
                    )}>
                      <RadioGroupItem value="full" id="full" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="full" className="font-semibold cursor-pointer">
                          Pay in full
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay NPR {(totalAmount + 500).toLocaleString()} now
                        </p>
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      paymentType === "partial" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground"
                    )}>
                      <RadioGroupItem value="partial" id="partial" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="partial" className="font-semibold cursor-pointer">
                          Pay 20% now
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay NPR {partialAmount.toLocaleString()} now, NPR {remainingAmount.toLocaleString()} on check-in
                        </p>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* eSewa Payment Button */}
                  <div className="mt-6 space-y-3">
                    <Button 
                      className="w-full bg-[#60BB46] hover:bg-[#4fa03a] text-white"
                      size="lg"
                      onClick={handlePayment}
                    >
                      <img 
                        src="https://esewa.com.np/common/images/esewa_logo.png" 
                        alt="eSewa" 
                        className="w-20 h-6 mr-2 object-contain bg-white rounded px-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      Pay with eSewa
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowCheckout(false)}
                    >
                      Back to Details
                    </Button>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Check-in</span>
                      <span className="font-medium">{checkInDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-out</span>
                      <span className="font-medium">{checkOutDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests</span>
                      <span className="font-medium">{guests}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border font-semibold">
                      <span>
                        {paymentType === "full" ? "Total" : "Due now"}
                      </span>
                      <span>
                        NPR {(paymentType === "full" ? totalAmount + 500 : partialAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
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
