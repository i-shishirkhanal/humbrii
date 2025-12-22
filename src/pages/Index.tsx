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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRef } from "react";

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
  {
    id: "h3",
    name: "City Center Express",
    location: "Kathmandu, Nepal",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    rating: 4.5,
    pricePerNight: 1000,
    maxGuests: 2,
    bedrooms: 1,
    propertyType: "Hourly",
    bookingType: "hourly",
  },
  {
    id: "h4",
    name: "Bhaktapur Heritage Stay",
    location: "Bhaktapur, Nepal",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    rating: 4.7,
    pricePerNight: 1100,
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
  {
    id: "d3",
    name: "Sunrise Valley Resort",
    location: "Dhulikhel, Nepal",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80",
    rating: 4.8,
    pricePerNight: 3800,
    maxGuests: 4,
    bedrooms: 2,
    propertyType: "Daycation",
    bookingType: "daycation",
  },
  {
    id: "d4",
    name: "Himalayan Spa Day",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    rating: 4.9,
    pricePerNight: 4500,
    maxGuests: 4,
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
  {
    id: "f3",
    name: "Lakeside Paradise Villa",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    rating: 4.7,
    pricePerNight: 12000,
    maxGuests: 6,
    bedrooms: 3,
    propertyType: "Full Stay",
    bookingType: "fullstay",
  },
  {
    id: "f4",
    name: "Nagarkot Mountain Lodge",
    location: "Nagarkot, Nepal",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    rating: 4.6,
    pricePerNight: 7500,
    maxGuests: 4,
    bedrooms: 2,
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
  {
    id: "v3",
    name: "Garden Terrace Cafe",
    location: "Patan, Nepal",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    rating: 4.6,
    pricePerNight: 2000,
    maxGuests: 10,
    bedrooms: 1,
    propertyType: "Vibe & Chill",
    bookingType: "vibe",
  },
  {
    id: "v4",
    name: "Mountain View Terrace",
    location: "Nagarkot, Nepal",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    rating: 4.7,
    pricePerNight: 2800,
    maxGuests: 8,
    bedrooms: 1,
    propertyType: "Vibe & Chill",
    bookingType: "vibe",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Properties",
    description: "Every property is verified for quality and authenticity.",
  },
  {
    icon: Clock,
    title: "Flexible Booking",
    description: "Book by the hour, day, or full stay.",
  },
  {
    icon: Heart,
    title: "Best Price Guarantee",
    description: "Find a lower price? We'll match it.",
  },
];

const bookingTypes = [
  { id: "hourly", label: "Hourly", icon: Clock },
  { id: "daycation", label: "Daycation", icon: Sun },
  { id: "fullstay", label: "Full Stay", icon: Moon },
  { id: "vibe", label: "Vibe & Chill", icon: Zap },
];

interface ScrollableSectionProps {
  title: string;
  subtitle: string;
  properties: typeof hourlyProperties;
  linkTo: string;
  bgClass?: string;
}

const ScrollableSection = ({ title, subtitle, properties, linkTo, bgClass = "" }: ScrollableSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={`py-6 md:py-10 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground text-xs md:text-sm mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link to={linkTo}>
              <Button variant="ghost" size="sm" className="text-xs h-8 px-2 md:px-3">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} compact />
          ))}
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const [activeBookingType, setActiveBookingType] = useState("daycation");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-8 md:pt-24 md:pb-16 bg-gradient-hero overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 md:w-96 h-64 md:h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight animate-fade-up">
              Find Your Perfect
              <span className="text-gradient"> Stay in Nepal</span>
            </h1>

            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Discover handpicked hotels, resorts, and unique accommodations.
            </p>

            {/* Booking Type Tabs */}
            <div className="mt-4 md:mt-6 flex justify-center animate-fade-up" style={{ animationDelay: "0.15s" }}>
              <div className="inline-flex items-center gap-0.5 p-1 bg-secondary/80 backdrop-blur-sm rounded-full border border-border">
                {bookingTypes.map((type) => {
                  const Icon = type.icon;
                  const isActive = activeBookingType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveBookingType(type.id)}
                      className={`flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Widget */}
            <div className="mt-4 md:mt-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-secondary/80 backdrop-blur-sm rounded-xl border border-border p-1.5 md:p-2">
                <div className="flex flex-col sm:flex-row items-stretch gap-1.5 md:gap-2">
                  {/* Location */}
                  <div className="flex-1 bg-card rounded-lg px-3 py-2 flex items-center gap-2 border border-transparent hover:border-primary/30 transition-colors">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Location</span>
                      <input
                        type="text"
                        placeholder="Kathmandu"
                        className="bg-transparent text-xs md:text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-8 bg-border self-center" />

                  {/* Date */}
                  <div className="flex-1 bg-card rounded-lg px-3 py-2 flex items-center gap-2 border border-transparent hover:border-primary/30 transition-colors">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Date</span>
                      <input
                        type="text"
                        placeholder="Today"
                        className="bg-transparent text-xs md:text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-8 bg-border self-center" />

                  {/* Time - Hidden on mobile */}
                  <div className="hidden md:flex flex-1 bg-card rounded-lg px-3 py-2 items-center gap-2 border border-transparent hover:border-primary/30 transition-colors">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Time</span>
                      <input
                        type="text"
                        placeholder="10 AM - 6 PM"
                        className="bg-transparent text-xs md:text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-8 bg-border self-center" />

                  {/* Guests */}
                  <div className="flex-1 bg-card rounded-lg px-3 py-2 flex items-center gap-2 border border-transparent hover:border-primary/30 transition-colors">
                    <Users className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Guests</span>
                      <input
                        type="text"
                        placeholder="2 Guests"
                        className="bg-transparent text-xs md:text-sm font-medium text-foreground placeholder:text-foreground focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button className="p-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
                      <Map className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <Button size="sm" className="h-9 px-3 md:px-4 rounded-lg">
                      <Search className="w-4 h-4" />
                      <span className="ml-1.5 hidden sm:inline">Search</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-3 md:p-4 rounded-xl bg-card border border-border hover:shadow-medium transition-shadow animate-fade-up flex items-start gap-3"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-card-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sections with Horizontal Scroll */}
      <ScrollableSection
        title="Featured Hourly"
        subtitle="Quick stays by the hour"
        properties={hourlyProperties}
        linkTo="/properties?type=hourly"
      />

      <ScrollableSection
        title="Featured Daycation"
        subtitle="Perfect day escapes"
        properties={daycationProperties}
        linkTo="/properties?type=daycation"
        bgClass="bg-muted/30"
      />

      <ScrollableSection
        title="Featured Full Stay"
        subtitle="Extended comfort stays"
        properties={fullStayProperties}
        linkTo="/properties?type=fullstay"
      />

      <ScrollableSection
        title="Featured Vibe & Chill"
        subtitle="Relax and unwind spots"
        properties={vibeProperties}
        linkTo="/properties?type=vibe"
        bgClass="bg-muted/30"
      />

      {/* Become a Host CTA */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-gradient-dark p-5 md:p-10">
            <div className="absolute top-0 right-0 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative text-center md:text-left max-w-lg mx-auto md:mx-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 rounded-full text-primary text-[10px] md:text-xs font-medium mb-2 md:mb-3">
                <Building2 className="w-3 h-3" />
                For Property Owners
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                List Your Property & Start Earning
              </h2>
              <p className="text-white/70 mb-4 text-xs md:text-sm">
                Join hundreds of hosts across Nepal. Reach thousands of travelers.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
                <Link to="/auth?mode=signup&role=host">
                  <Button variant="hero" size="sm" className="w-full sm:w-auto text-xs h-9">
                    Become a Host
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/host-info">
                  <Button variant="hero-outline" size="sm" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-xs h-9">
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