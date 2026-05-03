import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import StatCard from "@/components/cards/StatCard";
import BookingCard from "@/components/cards/BookingCard";
import { Calendar, MapPin, CreditCard, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// Define types
interface Booking {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  check_in: string;
  check_out: string;
  properties: {
    name: string;
    images: string[];
    city: string;
    category: string;
  };
}

const UserActivities = () => {
  const { user } = useAuth();

  /* Fetch live bookings */
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["user-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, properties(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Booking[];
    },
    enabled: !!user,
  });

  const now = new Date();

  const upcomingBookings = bookings?.filter(b => new Date(b.check_in) > now && b.status !== 'cancelled') || [];
  const pastBookings = bookings?.filter(b => new Date(b.check_out) < now && b.status === 'completed') || [];
  const totalSpent = bookings
    ?.filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;

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
                value={upcomingBookings.length}
                icon={Calendar}
                iconColor="text-primary"
              />
              <StatCard
                title="Past Stays"
                value={pastBookings.length}
                icon={MapPin}
                iconColor="text-success"
              />
              <StatCard
                title="Total Spent"
                value={`NPR ${totalSpent.toLocaleString()}`}
                icon={CreditCard}
                iconColor="text-accent"
              />
              <StatCard
                title="Avg Rating Given"
                value="N/A"
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
                {isLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : bookings?.length === 0 ? (
                  <p className="text-muted-foreground">No bookings found</p>
                ) : (
                  bookings?.slice(0, 3).map((booking) => (
                    <BookingCard
                      key={booking.id}
                      id={booking.id}
                      propertyName={booking.properties?.name || "Unknown Property"}
                      propertyImage={booking.properties?.images?.[0]}
                      location={booking.properties?.city || "Unknown Location"}
                      checkIn={new Date(booking.check_in).toLocaleDateString()}
                      checkOut={new Date(booking.check_out).toLocaleDateString()}
                      status={booking.status}
                      totalAmount={booking.total_amount}
                      bookingType={booking.properties?.category || "full_stay"}
                    />
                  ))
                )}
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
      </main >

      <BottomNav />
    </div >
  );
};

export default UserActivities;
