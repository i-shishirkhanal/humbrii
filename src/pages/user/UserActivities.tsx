import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import StatCard from "@/components/cards/StatCard";
import BookingCard from "@/components/cards/BookingCard";
import { Calendar, MapPin, CreditCard, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const mockBookings = [
  {
    id: "1",
    propertyName: "Himalayan View Resort",
    propertyImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    location: "Pokhara, Nepal",
    checkIn: "Dec 25, 2024",
    checkOut: "Dec 28, 2024",
    status: "confirmed" as const,
    totalAmount: 25500,
    bookingType: "full_stay" as const,
  },
  {
    id: "2",
    propertyName: "Heritage Boutique Hotel",
    propertyImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    location: "Bhaktapur, Nepal",
    checkIn: "Jan 5, 2025",
    checkOut: "Jan 6, 2025",
    status: "pending" as const,
    totalAmount: 6200,
    bookingType: "daycation" as const,
  },
];

const UserActivities = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>

          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Your Activities
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your bookings and travel history
                </p>
              </div>
              <Link to="/properties">
                <Button variant="default">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Properties
                </Button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Upcoming Bookings"
                value={2}
                icon={Calendar}
                iconColor="text-primary"
              />
              <StatCard
                title="Past Stays"
                value={8}
                icon={MapPin}
                iconColor="text-success"
              />
              <StatCard
                title="Total Spent"
                value="NPR 85,400"
                icon={CreditCard}
                iconColor="text-accent"
              />
              <StatCard
                title="Avg Rating Given"
                value="4.7"
                icon={Star}
                iconColor="text-warning"
              />
            </div>

            {/* Upcoming Bookings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Recent Bookings</h2>
                <Link to="/dashboard/bookings">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {mockBookings.map((booking) => (
                  <BookingCard key={booking.id} {...booking} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/dashboard/profile" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center">
                  <span className="text-sm font-medium text-foreground">Update Profile</span>
                </Link>
                <Link to="/properties" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center">
                  <span className="text-sm font-medium text-foreground">Browse Properties</span>
                </Link>
                <Link to="/dashboard/bookings" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center">
                  <span className="text-sm font-medium text-foreground">View Bookings</span>
                </Link>
                <Link to="/dashboard/favorites" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center">
                  <span className="text-sm font-medium text-foreground">My Favorites</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default UserActivities;
