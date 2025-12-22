import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/cards/PropertyCard";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Shield,
  Clock,
  Heart,
  Star,
  ArrowRight,
  Building2,
  Sparkles,
} from "lucide-react";

const featuredProperties = [
  {
    id: "1",
    name: "Himalayan View Resort",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    rating: 4.9,
    pricePerNight: 8500,
    maxGuests: 4,
    bedrooms: 2,
    propertyType: "Resort",
  },
  {
    id: "2",
    name: "Heritage Boutique Hotel",
    location: "Bhaktapur, Nepal",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    rating: 4.8,
    pricePerNight: 6200,
    maxGuests: 2,
    bedrooms: 1,
    propertyType: "Boutique Hotel",
  },
  {
    id: "3",
    name: "Lakeside Paradise Villa",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    rating: 4.7,
    pricePerNight: 12000,
    maxGuests: 6,
    bedrooms: 3,
    propertyType: "Villa",
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-hero overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4" />
              Nepal's #1 Booking Platform
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Find Your Perfect
              <span className="text-gradient"> Stay in Nepal</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Discover handpicked hotels, resorts, and unique accommodations across Nepal. 
              Book with confidence and create unforgettable memories.
            </p>

            {/* Search Box */}
            <div className="mt-10 p-4 bg-card rounded-2xl shadow-strong border border-border animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Check-in - Check-out"
                    className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Guests"
                    className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button size="lg" className="h-auto py-3">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <div>
                <p className="text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Properties</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Happy Guests</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">4.8</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-medium transition-shadow animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Properties</h2>
              <p className="text-muted-foreground mt-2">Handpicked stays for your next adventure</p>
            </div>
            <Link to="/properties">
              <Button variant="ghost" className="hidden md:flex">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/properties">
              <Button variant="outline">
                View All Properties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Become a Host CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-dark p-8 md:p-16">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full text-primary text-sm font-medium mb-4">
                  <Building2 className="w-4 h-4" />
                  For Property Owners
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  List Your Property & Start Earning
                </h2>
                <p className="text-white/70 mb-8">
                  Join hundreds of hosts across Nepal. List your hotel, resort, or unique space 
                  and reach thousands of travelers looking for their perfect stay.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/auth?mode=signup&role=host">
                    <Button variant="hero" size="lg">
                      Become a Host
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/host-info">
                    <Button variant="hero-outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <p className="text-3xl font-bold text-white">20K+</p>
                    <p className="text-white/70 text-sm">Monthly Bookings</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center mt-8">
                    <p className="text-3xl font-bold text-white">NPR 5L+</p>
                    <p className="text-white/70 text-sm">Avg Host Earnings</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <p className="text-3xl font-bold text-white">98%</p>
                    <p className="text-white/70 text-sm">Host Satisfaction</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center mt-8">
                    <p className="text-3xl font-bold text-white">24/7</p>
                    <p className="text-white/70 text-sm">Host Support</p>
                  </div>
                </div>
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
