import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/cards/PropertyCard";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  Shield,
  Heart,
  ArrowRight,
  Building2,
  Sun,
  Moon,
  Zap,
  Map,
} from "lucide-react";

const hourlyProperties = [
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
    propertyType: "Hourly",
    bookingType: "hourly",
  },
];

const daycationProperties = [
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
    propertyType: "Daycation",
    bookingType: "daycation",
  },
];

const fullStayProperties = [
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
    bookingType: "fullstay",
  },
  {
    id: "f2",
    name: "Heritage Boutique Hotel",
    location: "Bhaktapur, Nepal",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80",
    rating: 4.8,
    pricePerNight: 6200,
    maxGuests: 2,
    bedrooms: 1,
    propertyType: "Full Stay",
    bookingType: "fullstay",
  },
];

const vibeProperties = [
  {
    id: "v1",
    name: "Rooftop Lounge & Chill",
    location: "Kathmandu, Nepal",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    rating: 4.8,
    pricePerNight: 2500,
    maxGuests: 8,
    bedrooms: 1,
    propertyType: "Vibe & Chill",
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
    propertyType: "Vibe & Chill",
    bookingType: "vibe",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Properties",
    description: "Every property is verified by our team for quality and authenticity.",
  },
  {
    icon: Clock,
    title: "Flexible Booking",
    description: "Book by the hour, day, or full stay - whatever suits your needs.",
  },
  {
    icon: Heart,
    title: "Best Price Guarantee",
    description: "Find a lower price? We'll match it and give you extra credit.",
  },
];

const bookingTypes = [
  { id: "hourly", label: "Hourly", icon: Clock },
  { id: "daycation", label: "Daycation", icon: Sun },
  { id: "fullstay", label: "Full Stay", icon: Moon },
  { id: "vibe", label: "Vibe & Chill", icon: Zap },
];

const Index = () => {
  const [activeBookingType, setActiveBookingType] = useState("daycation");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-20 bg-gradient-hero overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight animate-fade-up">
              Find Your Perfect
              <span className="text-gradient"> Stay in Nepal</span>
            </h1>

            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Discover handpicked hotels, resorts, and unique accommodations across Nepal.
            </p>

            {/* Booking Type Tabs */}
            <div className="mt-6 md:mt-8 flex justify-center animate-fade-up" style={{ animationDelay: "0.15s" }}>
              <div className="inline-flex items-center gap-0.5 md:gap-1 p-1 md:p-1.5 bg-secondary/80 backdrop-blur-sm rounded-full border border-border overflow-x-auto">
                {bookingTypes.map((type) => {
                  const Icon = type.icon;
                  const isActive = activeBookingType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveBookingType(type.id)}
                      className={`flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden xs:inline md:inline">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Widget */}
            <div className="mt-4 md:mt-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-secondary/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border p-2">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                  {/* Location */}
                  <div className="flex-1 bg-card rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 border border-transparent hover:border-primary/30 transition-colors">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Location</span>
                      <input
                        type="text"
                        placeholder="Kathmandu"
                        className="bg-transparent text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-10 bg-border" />

                  {/* Date */}
                  <div className="flex-1 bg-card rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 border border-transparent hover:border-primary/30 transition-colors">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Date</span>
                      <input
                        type="text"
                        placeholder="Today"
                        className="bg-transparent text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-10 bg-border" />

                  {/* Time */}
                  <div className="flex-1 bg-card rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 border border-transparent hover:border-primary/30 transition-colors">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Time</span>
                      <input
                        type="text"
                        placeholder="10 AM - 6 PM"
                        className="bg-transparent text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-10 bg-border" />

                  {/* Guests */}
                  <div className="flex-1 bg-card rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 border border-transparent hover:border-primary/30 transition-colors">
                    <Users className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Guests</span>
                      <input
                        type="text"
                        placeholder="2 Guests"
                        className="bg-transparent text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 md:p-3 rounded-lg md:rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                      <Map className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    </button>
                    <Button size="default" className="h-10 md:h-12 flex-1 md:flex-none md:w-auto md:px-6 rounded-lg md:rounded-xl">
                      <Search className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="ml-2">Search</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border hover:shadow-medium transition-shadow animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-card-foreground mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hourly */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Hourly</h2>
              <p className="text-muted-foreground text-sm mt-1">Quick stays by the hour</p>
            </div>
            <Link to="/properties?type=hourly">
              <Button variant="ghost" size="sm" className="text-sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {hourlyProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Daycation */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Daycation</h2>
              <p className="text-muted-foreground text-sm mt-1">Perfect day escapes</p>
            </div>
            <Link to="/properties?type=daycation">
              <Button variant="ghost" size="sm" className="text-sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {daycationProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Full Stay */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Full Stay</h2>
              <p className="text-muted-foreground text-sm mt-1">Extended comfort stays</p>
            </div>
            <Link to="/properties?type=fullstay">
              <Button variant="ghost" size="sm" className="text-sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {fullStayProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vibe & Chill */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Vibe & Chill</h2>
              <p className="text-muted-foreground text-sm mt-1">Relax and unwind spots</p>
            </div>
            <Link to="/properties?type=vibe">
              <Button variant="ghost" size="sm" className="text-sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {vibeProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      {/* Become a Host CTA */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-dark p-6 md:p-12">
            <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full text-primary text-xs md:text-sm font-medium mb-3 md:mb-4">
                <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                For Property Owners
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                List Your Property & Start Earning
              </h2>
              <p className="text-white/70 mb-6 text-sm md:text-base max-w-xl mx-auto md:mx-0">
                Join hundreds of hosts across Nepal. List your hotel, resort, or unique space 
                and reach thousands of travelers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/auth?mode=signup&role=host">
                  <Button variant="hero" size="default" className="w-full sm:w-auto">
                    Become a Host
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/host-info">
                  <Button variant="hero-outline" size="default" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;