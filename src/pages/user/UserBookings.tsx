
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import BookingCard from "@/components/cards/BookingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsService } from "@/services/bookings.service";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const UserBookings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [page, setPage] = useState(0);

  // Reset page when tab changes
  const { data: bookings = [], isLoading, isFetching } = useQuery({
    queryKey: ["user-bookings", user?.id, page, activeTab],
    queryFn: () => {
      if (!user) return Promise.resolve([]);
      return bookingsService.getUserBookings(page, user.id, activeTab);
    },
    enabled: !!user,
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper to map DB response to Card props
  const mapBookingToCard = (booking: typeof bookings[0]) => ({
    id: booking.id,
    propertyName: booking.properties?.name || "Unknown Property",
    propertyImage: booking.properties?.images?.[0] || "/placeholder.svg",
    location: booking.properties?.location || "Unknown Location",
    checkIn: new Date(booking.check_in_date).toLocaleDateString(),
    checkOut: new Date(booking.check_out_date).toLocaleDateString(),
    status: booking.booking_status,
    totalAmount: booking.total_amount,
    paidAmount: 0,
    paymentType: "esewa",
    bookingType: booking.properties?.category || "full_stay",
    hasRated: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Bookings</h1>
              <p className="text-muted-foreground mt-1">Manage and view all your bookings</p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as "upcoming" | "past");
                setPage(0); // Reset page on tab switch
              }}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-4">
                <div className="space-y-4">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <BookingCard key={booking.id} {...mapBookingToCard(booking)} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming bookings on this page.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="past" className="mt-4">
                <div className="space-y-4">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <BookingCard key={booking.id} {...mapBookingToCard(booking)} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No past bookings on this page.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Pagination Controls */}
            <div className="flex justify-center flex-col items-center gap-2 mt-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0 || isFetching}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={bookings.length < 10 || isFetching} // Assuming PAGE_SIZE is 10
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              {isFetching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>

          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default UserBookings;
