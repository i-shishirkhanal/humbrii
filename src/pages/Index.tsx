import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import PropertyCard from "@/components/cards/PropertyCard";
import SearchWidget, { BookingType } from "@/components/search/SearchWidget";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Plane,
  Briefcase,
  HeartPulse,
  Home,
  Laptop,
  Star,
} from "lucide-react";

const whoWeServe = [
  {
    icon: Plane,
    title: "Transit Travelers",
    description: "Early arrival or late departure",
  },
  {
    icon: Briefcase,
    title: "Business & Meetings",
    description: "Rest or work between meetings",
  },
  {
    icon: HeartPulse,
    title: "Medical Visits",
    description: "Comfort near hospitals",
  },
  {
    icon: Home,
    title: "Domestic Travelers",
    description: "Flexible plans, short breaks",
  },
  {
    icon: Laptop,
    title: "Remote Work",
    description: "Quiet space, fast Wi-Fi",
  },
];

interface PropertyData {
  id: string;
  name: string;
  location: string;
  images: string[] | null;
  base_price: number;
  category: string;
  currency: string | null;
  is_featured?: boolean;
}

interface ScrollableSectionProps {
  title: string;
  subtitle: string;
  properties: PropertyData[];
  linkTo: string;
  bgClass?: string;
  featured?: boolean;
}

const ScrollableSection = ({ title, subtitle, properties, linkTo, bgClass = "", featured = false }: ScrollableSectionProps) => {
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      hourly: "Hourly",
      daycation: "Daycation",
      full_stay: "Full Stay",
      vibe_chill: "Vibe & Chill",
    };
    return labels[category] || category;
  };

  if (properties.length === 0) return null;

  return (
    <section className={`py-6 md:py-10 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {featured && <Star className="w-5 h-5 text-primary fill-primary" />}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
              <p className="text-muted-foreground text-xs md:text-sm mt-0.5">{subtitle}</p>
            </div>
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
            <PropertyCard 
              key={property.id} 
              id={property.id}
              name={property.name}
              location={property.location}
              image={property.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
              pricePerNight={property.base_price}
              propertyType={getCategoryLabel(property.category)}
              rating={4.5}
              maxGuests={4}
              bedrooms={2}
              compact 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const [activeBookingType, setActiveBookingType] = useState<BookingType>("daycation");

  // Fetch featured properties
  const { data: featuredProperties } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .eq("status", "active")
        .eq("is_featured", true)
        .limit(10);
      
      if (error) throw error;
      return data as PropertyData[];
    },
  });

  // Fetch properties by category
  const { data: hourlyProperties } = useQuery({
    queryKey: ["hourly-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .eq("status", "active")
        .eq("category", "hourly")
        .limit(8);
      
      if (error) throw error;
      return data as PropertyData[];
    },
  });

  const { data: daycationProperties } = useQuery({
    queryKey: ["daycation-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .eq("status", "active")
        .eq("category", "daycation")
        .limit(8);
      
      if (error) throw error;
      return data as PropertyData[];
    },
  });

  const { data: fullStayProperties } = useQuery({
    queryKey: ["fullstay-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .eq("status", "active")
        .eq("category", "full_stay")
        .limit(8);
      
      if (error) throw error;
      return data as PropertyData[];
    },
  });

  const { data: vibeProperties } = useQuery({
    queryKey: ["vibe-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .eq("status", "active")
        .eq("category", "vibe_chill")
        .limit(8);
      
      if (error) throw error;
      return data as PropertyData[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-8 md:pt-28 md:pb-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-[10%] w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="absolute top-32 left-[25%] w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-20 right-[15%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-40 right-[30%] w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>
        
        {/* Decorative Gradient Orbs */}
        <div className="absolute top-10 left-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-accent/15 via-primary/10 to-transparent rounded-full blur-3xl translate-x-1/3" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-medium text-primary">500+ Properties Across Nepal</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-up">
              Find Your Perfect
              <span className="text-gradient block sm:inline"> Stay in Nepal</span>
            </h1>

            <p className="mt-4 md:mt-5 text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
              Discover handpicked hotels, resorts, and unique accommodations.
            </p>

            {/* Search Widget with Tabs */}
            <div className="mt-6 md:mt-8 animate-fade-up" style={{ animationDelay: "0.15s" }}>
              <SearchWidget
                activeType={activeBookingType}
                onTypeChange={setActiveBookingType}
                showTabs={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-6 md:py-12 lg:py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-base md:text-2xl lg:text-3xl font-bold text-foreground mb-1 md:mb-2">Who We Serve</h2>
            <p className="text-muted-foreground text-xs md:text-base">Perfect stays for every need</p>
          </div>
          <div className="flex gap-2 md:gap-4 lg:gap-6 overflow-x-auto pb-2 scrollbar-hide scroll-smooth md:justify-center md:flex-wrap" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {whoWeServe.map((item) => (
              <div
                key={item.title}
                className="flex-shrink-0 w-24 md:w-40 lg:w-48 p-2.5 md:p-5 lg:p-6 rounded-lg md:rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all text-center group"
              >
                <div className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 md:mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-4 h-4 md:w-6 md:h-6 lg:w-7 lg:h-7 text-primary" />
                </div>
                <h3 className="text-card-foreground font-medium text-[10px] md:text-sm lg:text-base mb-0.5 md:mb-1 leading-tight">{item.title}</h3>
                <p className="text-muted-foreground text-[8px] md:text-xs lg:text-sm leading-tight">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      {featuredProperties && featuredProperties.length > 0 && (
        <ScrollableSection
          title="Featured Properties"
          subtitle="Handpicked by our team"
          properties={featuredProperties}
          linkTo="/properties"
          bgClass="bg-primary/5"
          featured={true}
        />
      )}

      {/* Category Sections with Horizontal Scroll */}
      <ScrollableSection
        title="Hourly Stays"
        subtitle="Quick stays by the hour"
        properties={hourlyProperties || []}
        linkTo="/properties?type=hourly"
      />

      <ScrollableSection
        title="Daycation"
        subtitle="Perfect day escapes"
        properties={daycationProperties || []}
        linkTo="/properties?type=daycation"
        bgClass="bg-muted/30"
      />

      <ScrollableSection
        title="Full Stay"
        subtitle="Extended comfort stays"
        properties={fullStayProperties || []}
        linkTo="/properties?type=fullstay"
      />

      <ScrollableSection
        title="Vibe & Chill"
        subtitle="Relax and unwind spots"
        properties={vibeProperties || []}
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
      
      {/* Bottom Navigation for Mobile */}
      <BottomNav />
      
      {/* Add padding for bottom nav on mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
};

export default Index;