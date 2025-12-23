import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import BookingCard from "@/components/cards/BookingCard";
import { Calendar, MapPin, CreditCard, Star } from "lucide-react";
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

const UserDashboard = () => {
  const { profile } = useAuth();
  const displayName = profile?.full_name || "User";

  return (
    <DashboardLayout role="user">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your bookings
            </p>
          </div>
          <Link to="/properties">
            <Button variant="hero">
              <MapPin className="w-4 h-4 mr-2" />
              Find Properties
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <h2 className="text-xl font-semibold text-foreground">Upcoming Bookings</h2>
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
            <Link to="/contact" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center">
              <span className="text-sm font-medium text-foreground">Get Support</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
